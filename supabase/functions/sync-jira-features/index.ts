import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { resolveIntegrationConfigStrict, isResolveError } from "../_shared/integration-resolver.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { epicId, projectId } = await req.json();

    if (!epicId) {
      throw new Error('epicId is required');
    }

    // 1. Load the epic to get jira_epic_key
    const { data: epic, error: epicError } = await supabaseClient
      .from('epics')
      .select('id, title, jira_epic_key, value_stream_id')
      .eq('id', epicId)
      .maybeSingle();

    if (epicError) throw epicError;
    if (!epic) throw new Error('Epic not found');
    if (!epic.jira_epic_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Jira Epic Key configured. Edit the epic and set the Jira Epic Key first.',
          created: 0,
          updated: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Resolve Jira integration config (strict: verifies user token)
    const jiraResolved = await resolveIntegrationConfigStrict(supabaseClient, 'jira', {
      projectId,
      userId: user.id,
    });

    if (isResolveError(jiraResolved)) {
      return new Response(
        JSON.stringify({
          success: false,
          ...jiraResolved,
          created: 0,
          updated: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const boardUrl = jiraResolved.config?.board_url;
    if (!boardUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'NOT_CONFIGURED',
          reconnect_required: true,
          integration_type: 'jira',
          message: 'Jira board not connected to this project. Configure Jira integration first.',
          created: 0,
          updated: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }


    // 3. Get Jira credentials (user token or system token)
    const { data: userTokenInfo } = await supabaseClient
      .from('user_jira_tokens_safe')
      .select('has_token, has_jira_email, has_jira_site_url')
      .eq('user_id', user.id)
      .maybeSingle();

    let jiraToken: string | null = null;
    let jiraEmail: string | null = null;
    let jiraSiteUrl: string | null = null;

    if (userTokenInfo?.has_token) {
      const decryptResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/decrypt-token`,
        {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
            'X-Caller-Function': 'sync-jira-features',
          },
          body: JSON.stringify({ integrationType: 'jira', includeMetadata: true }),
        }
      );

      if (decryptResponse.ok) {
        const decryptedData = await decryptResponse.json();
        jiraToken = decryptedData.token;
        jiraEmail = decryptedData.metadata?.jira_email || null;
        jiraSiteUrl = decryptedData.metadata?.jira_site_url || null;
      }
    }

    if (!jiraToken) {
      jiraToken = Deno.env.get('JIRA_API_TOKEN') ?? null;
    }

    if (!jiraToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Jira not connected. Please configure your Jira token first.',
          created: 0,
          updated: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Extract site URL from board URL if not from user token
    if (!jiraSiteUrl) {
      const urlMatch = boardUrl.match(/(https:\/\/[^\/]+)/);
      if (!urlMatch) throw new Error('Invalid Jira board URL');
      jiraSiteUrl = urlMatch[1];
    }

    // 4. Fetch Jira issues linked to the epic key
    const authHeader = jiraEmail
      ? `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`
      : `Bearer ${jiraToken}`;

    // JQL: find all issues whose "Epic Link" or parent matches the epic key
    const jql = encodeURIComponent(
      `"Epic Link" = "${epic.jira_epic_key}" OR parent = "${epic.jira_epic_key}" ORDER BY rank ASC`
    );
    const fields = 'summary,description,status,priority,customfield_10016,issuetype,labels,assignee';
    const jiraUrl = `${jiraSiteUrl}/rest/api/3/search?jql=${jql}&fields=${fields}&maxResults=100`;

    console.log(`Fetching Jira issues for epic key: ${epic.jira_epic_key}`);

    const jiraResponse = await fetch(jiraUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    if (!jiraResponse.ok) {
      const errorText = await jiraResponse.text();
      console.error('Jira API error:', errorText);
      throw new Error(`Jira API error: ${jiraResponse.status}`);
    }

    const jiraData = await jiraResponse.json();
    const issues = jiraData.issues || [];

    if (issues.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `No Jira issues found linked to ${epic.jira_epic_key}`,
          created: 0,
          updated: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 5. Load existing features for this epic (for dedup by jira_issue_key)
    const { data: existingFeatures } = await supabaseClient
      .from('features')
      .select('id, jira_issue_key, title')
      .eq('epic_id', epicId)
      .not('jira_issue_key', 'is', null);

    const existingByKey = new Map(
      (existingFeatures || []).map(f => [f.jira_issue_key, f])
    );

    // Get max display_order for new features
    const { data: maxOrderData } = await supabaseClient
      .from('features')
      .select('display_order')
      .eq('epic_id', epicId)
      .order('display_order', { ascending: false })
      .limit(1);

    let nextOrder = (maxOrderData?.[0]?.display_order ?? 0) + 1;

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    // 6. Upsert features from Jira issues
    for (const issue of issues) {
      const issueKey = issue.key;
      const fields = issue.fields;
      const storyPoints = fields.customfield_10016 || null;

      // Map Jira priority to our priority
      const priorityMap: Record<string, string> = {
        'Highest': 'critical',
        'High': 'high',
        'Medium': 'medium',
        'Low': 'low',
        'Lowest': 'low',
      };
      const priority = priorityMap[fields.priority?.name] || 'medium';

      // Map Jira status to our feature status
      const statusName = (fields.status?.name || '').toLowerCase();
      let status = 'backlog';
      if (statusName.includes('done') || statusName.includes('closed') || statusName.includes('resolved')) {
        status = 'completed';
      } else if (statusName.includes('progress') || statusName.includes('review')) {
        status = 'in_progress';
      } else if (statusName.includes('todo') || statusName.includes('to do') || statusName.includes('open')) {
        status = 'backlog';
      }

      // Extract plain text description from Jira ADF
      let description = '';
      if (fields.description) {
        if (typeof fields.description === 'string') {
          description = fields.description;
        } else if (fields.description.content) {
          description = fields.description.content
            .map((block: any) =>
              block.content?.map((inline: any) => inline.text || '').join('') || ''
            )
            .filter(Boolean)
            .join('\n');
        }
      }

      const jiraIssueUrl = `${jiraSiteUrl}/browse/${issueKey}`;

      try {
        const existing = existingByKey.get(issueKey);

        if (existing) {
          // Update existing feature
          const { error: updateError } = await supabaseClient
            .from('features')
            .update({
              title: fields.summary,
              description: description || null,
              effort_estimate: storyPoints,
              priority,
              status,
              jira_url: jiraIssueUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            errors.push(`Update ${issueKey}: ${updateError.message}`);
          } else {
            updated++;
          }
        } else {
          // Create new feature
          const { error: insertError } = await supabaseClient
            .from('features')
            .insert({
              epic_id: epicId,
              title: fields.summary,
              description: description || null,
              effort_estimate: storyPoints,
              priority,
              status,
              jira_issue_key: issueKey,
              jira_url: jiraIssueUrl,
              display_order: nextOrder++,
            });

          if (insertError) {
            errors.push(`Insert ${issueKey}: ${insertError.message}`);
          } else {
            created++;
          }
        }
      } catch (err) {
        errors.push(`${issueKey}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log(`Sync complete: ${created} created, ${updated} updated, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        created,
        updated,
        total: issues.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Synced ${created + updated} features from ${issues.length} Jira issues`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in sync-jira-features:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, created: 0, updated: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
