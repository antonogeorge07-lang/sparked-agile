import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limiting
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    const waitSeconds = Math.ceil((userLimit.resetAt - now) / 1000);
    throw new Error(`Rate limit exceeded. Try again in ${waitSeconds} seconds`);
  }
  
  userLimit.count++;
  return true;
}

// Input validation schema
const demoChecklistSchema = z.object({
  sprintNumber: z.number().int().positive().max(9999, "Sprint number must be less than 10000"),
  completedTickets: z.array(z.object({
    key: z.string(),
    summary: z.string(),
    issueType: z.string().optional(),
    storyPoints: z.number().optional(),
  })).max(200, "Too many tickets (max 200)").optional(),
  githubCommits: z.array(z.object({
    sha: z.string(),
    message: z.string(),
    author: z.string().optional(),
  })).max(200, "Too many commits (max 200)").optional(),
  projectName: z.string().min(1).max(200),
});

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

    // Rate limiting: 10 requests per minute for AI functions
    checkRateLimit(user.id, 10, 60000);

    // Validate input
    const rawInput = await req.json();
    const { 
      sprintNumber, 
      completedTickets,
      githubCommits,
      projectName 
    } = demoChecklistSchema.parse(rawInput);

    console.log(`Generating demo checklist for Sprint ${sprintNumber}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context for AI
    const ticketsContext = completedTickets?.map((ticket: any) => 
      `- ${ticket.key}: ${ticket.summary} (${ticket.issueType}, ${ticket.storyPoints} pts)`
    ).join('\n') || 'No tickets completed';

    const commitsContext = githubCommits?.slice(0, 20).map((commit: any) => 
      `- ${commit.sha}: ${commit.message.split('\n')[0]} by ${commit.author}`
    ).join('\n') || 'No commits found';

    const systemPrompt = `You are an expert Scrum Master and demo coordinator. Your role is to help teams prepare effective sprint review demos that showcase value delivered to stakeholders.`;

    const userPrompt = `Generate a Sprint Review demo checklist and summary for Sprint ${sprintNumber} of "${projectName}".

Completed JIRA Tickets:
${ticketsContext}

Recent GitHub Commits:
${commitsContext}

Please provide:
1. A compelling summary of achieved objectives (2-3 sentences highlighting business value)
2. A detailed demo checklist with specific items to demonstrate
3. Talking points for each demo item
4. Technical highlights worth mentioning
5. Suggested demo order (most impactful first)
6. Potential questions stakeholders might ask

Format the output in a structured, easy-to-follow format suitable for demo preparation.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limits exceeded. Please try again in a few moments.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI usage limits reached. Please add credits to your workspace.');
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    // Parse the generated content
    const lines = generatedContent.split('\n');
    
    // Extract achieved objectives
    const objectivesMatch = generatedContent.match(/achieved objectives[:\s]+([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
    const achievedObjectives = objectivesMatch ? objectivesMatch[1].trim() : '';

    // Extract demo checklist items
    const demoChecklist: string[] = [];
    let inChecklistSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('checklist') || line.toLowerCase().includes('demo items')) {
        inChecklistSection = true;
        continue;
      }
      if (inChecklistSection && (line.match(/^\d+\./) || line.match(/^[-*•]/))) {
        demoChecklist.push(line.replace(/^[\d\-*•.\s]+/, '').trim());
      }
      if (inChecklistSection && line.trim() === '' && demoChecklist.length > 0) {
        break;
      }
    }

    // Extract delivered features
    const deliveredFeatures: string[] = completedTickets?.map((t: any) => t.summary) || [];

    return new Response(
      JSON.stringify({
        success: true,
        achievedObjectives,
        demoChecklist: demoChecklist.length > 0 ? demoChecklist : [
          'Demonstrate new features from completed tickets',
          'Show technical improvements',
          'Highlight user experience enhancements',
          'Present performance metrics',
        ],
        fullContent: generatedContent,
        deliveredFeatures,
        completedTicketsCount: completedTickets?.length || 0,
        commitsCount: githubCommits?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-demo-checklist function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});