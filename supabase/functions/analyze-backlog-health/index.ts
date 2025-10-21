import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    const { projectId } = await req.json();
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Verify user has access to project
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      throw new Error('Unauthorized: User is not a member of this project');
    }

    const JIRA_API_TOKEN = Deno.env.get('JIRA_API_TOKEN');
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!JIRA_API_TOKEN || !GITHUB_TOKEN || !LOVABLE_API_KEY) {
      throw new Error('Required API keys not configured');
    }

    console.log('Fetching JIRA backlog for project:', projectId);

    // Get project integration details
    const { data: integration } = await supabase
      .from('integrations')
      .select('config')
      .eq('project_id', projectId)
      .eq('integration_type', 'jira')
      .single();

    if (!integration?.config) {
      throw new Error('JIRA integration not configured for this project');
    }

    const jiraConfig = integration.config as any;
    
    // Fetch JIRA backlog
    const jiraResponse = await fetch(
      `https://${jiraConfig.domain}/rest/api/3/search?jql=project=${jiraConfig.project_key} AND status!=Done ORDER BY created DESC&maxResults=100`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${jiraConfig.email}:${JIRA_API_TOKEN}`)}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!jiraResponse.ok) {
      throw new Error(`JIRA API error: ${jiraResponse.status}`);
    }

    const jiraData = await jiraResponse.json();
    const issues = jiraData.issues || [];

    console.log(`Fetched ${issues.length} JIRA issues`);

    // Fetch recent GitHub activity for velocity estimation
    const { data: githubIntegration } = await supabase
      .from('integrations')
      .select('config')
      .eq('project_id', projectId)
      .eq('integration_type', 'github')
      .single();

    let githubActivity = null;
    if (githubIntegration?.config) {
      const githubConfig = githubIntegration.config as any;
      const githubResponse = await fetch(
        `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/commits?per_page=50`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (githubResponse.ok) {
        githubActivity = await githubResponse.json();
        console.log(`Fetched ${githubActivity.length} GitHub commits`);
      }
    }

    // Process backlog items
    interface BacklogItem {
      key: string;
      summary: string;
      status: string;
      priority: string;
      age_days: number;
      has_description: boolean;
      has_acceptance_criteria: boolean;
      dependencies: string[];
      needs_po_attention?: boolean;
      recommendation?: string;
    }

    const backlogItems: BacklogItem[] = issues.map((issue: any) => {
      const createdDate = new Date(issue.fields.created);
      const ageDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const hasDescription = !!issue.fields.description;
      const hasAcceptanceCriteria = issue.fields.description?.includes('Acceptance Criteria');

      return {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'None',
        age_days: ageDays,
        has_description: hasDescription,
        has_acceptance_criteria: hasAcceptanceCriteria,
        dependencies: issue.fields.issuelinks?.map((link: any) => 
          link.outwardIssue?.key || link.inwardIssue?.key
        ).filter(Boolean) || [],
      };
    });

    // Prepare data for AI analysis
    const backlogSummary = {
      total_items: backlogItems.length,
      stale_items: backlogItems.filter((item: BacklogItem) => item.age_days > 30).length,
      unclear_items: backlogItems.filter((item: BacklogItem) => !item.has_description || !item.has_acceptance_criteria).length,
      items_with_dependencies: backlogItems.filter((item: BacklogItem) => item.dependencies.length > 0).length,
      github_commit_count: githubActivity?.length || 0,
      items_sample: backlogItems.slice(0, 10),
    };

    console.log('Requesting AI analysis...');

    // Get AI recommendations
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a Scrum Master assistant analyzing backlog health. Provide concise, actionable insights."
          },
          {
            role: "user",
            content: `Analyze this backlog health data and provide insights:\n\n${JSON.stringify(backlogSummary, null, 2)}\n\nProvide:
1. Velocity trend assessment (based on GitHub activity)
2. Top 3-5 actionable recommendations
3. Identify which items need PO attention (stale items over 30 days or unclear items)
4. Suggest re-estimation needs based on velocity

Format your response as JSON with fields: velocity_trend (string), recommendations (array of strings), items_needing_attention (array of issue keys)`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const insights = JSON.parse(aiData.choices[0].message.content);

    console.log('AI analysis complete');

    // Mark items needing PO attention
    const itemsNeedingAttention = new Set(insights.items_needing_attention || []);
    backlogItems.forEach((item: BacklogItem) => {
      item.needs_po_attention = itemsNeedingAttention.has(item.key) || 
                                 item.age_days > 30 || 
                                 !item.has_description ||
                                 !item.has_acceptance_criteria;
      
      if (item.needs_po_attention) {
        if (item.age_days > 30) {
          item.recommendation = `Item is ${item.age_days} days old. Consider re-estimation or reprioritization.`;
        } else if (!item.has_description) {
          item.recommendation = "Missing description. Add detailed requirements.";
        } else if (!item.has_acceptance_criteria) {
          item.recommendation = "Missing acceptance criteria. Define success criteria.";
        }
      }
    });

    const analysis = {
      total_items: backlogItems.length,
      stale_items: backlogSummary.stale_items,
      unclear_items: backlogSummary.unclear_items,
      items_with_dependencies: backlogSummary.items_with_dependencies,
      velocity_trend: insights.velocity_trend,
      recommendations: insights.recommendations,
      items: backlogItems,
    };

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-backlog-health:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
