import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { 
      sprintNumber, 
      backlogItems, 
      velocityData, 
      projectName,
      teamSize 
    } = await req.json();

    console.log(`Generating sprint planning for Sprint ${sprintNumber}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate team velocity average
    const velocityAvg = velocityData?.length > 0 
      ? Math.round(velocityData.reduce((sum: number, v: any) => sum + v.points, 0) / velocityData.length)
      : 30;

    // Build context for AI
    const backlogContext = backlogItems?.map((item: any) => 
      `- ${item.key}: ${item.summary} (Priority: ${item.priority || 'Medium'})`
    ).join('\n') || 'No backlog items available';

    const velocityContext = velocityData?.length > 0
      ? `Recent velocity: ${velocityData.map((v: any) => `Sprint ${v.sprint}: ${v.points} points`).join(', ')}`
      : 'No velocity data available';

    const systemPrompt = `You are an expert Agile coach and sprint planning assistant. Your role is to help teams plan effective sprints that are realistic, achievable, and aligned with business goals.`;

    const userPrompt = `Generate a comprehensive Sprint Planning agenda for Sprint ${sprintNumber} for "${projectName}".

Team Context:
- Team size: ${teamSize || 'Not specified'}
- Average velocity: ${velocityAvg} story points
- ${velocityContext}

Top Prioritized Backlog Items from JIRA:
${backlogContext}

Please provide:
1. A compelling Sprint Goal that aligns these items with a clear business objective
2. Recommended story point allocation (total should not exceed ${velocityAvg + 5} points to account for capacity)
3. Specific backlog items to include with estimated story points for each
4. A detailed meeting agenda with time allocations
5. Key discussion topics and decisions required
6. Potential risks and mitigation strategies

Format your response in a structured way that can be easily used in the sprint planning meeting.`;

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
      console.error('AI API error:', aiResponse.status, errorText);
      
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

    // Parse the generated content to extract structured data
    const lines = generatedContent.split('\n');
    const sprintGoalMatch = generatedContent.match(/Sprint Goal[:\s]+([^\n]+)/i);
    const sprintGoal = sprintGoalMatch ? sprintGoalMatch[1].trim() : '';

    // Extract story points estimate
    const pointsMatch = generatedContent.match(/(\d+)\s*(?:story\s*)?points/i);
    const storyPointsEstimate = pointsMatch ? parseInt(pointsMatch[1]) : velocityAvg;

    // Extract discussion topics (look for numbered or bulleted lists)
    const discussionTopics: string[] = [];
    let inDiscussionSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('discussion') || line.toLowerCase().includes('decisions')) {
        inDiscussionSection = true;
        continue;
      }
      if (inDiscussionSection && (line.match(/^\d+\./) || line.match(/^[-*•]/))) {
        discussionTopics.push(line.replace(/^[\d\-*•.\s]+/, '').trim());
      }
      if (inDiscussionSection && line.trim() === '') {
        break;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sprintGoal,
        storyPointsEstimate,
        agenda: generatedContent,
        discussionTopics: discussionTopics.length > 0 ? discussionTopics : [
          'Review and refine story estimates',
          'Identify dependencies and blockers',
          'Confirm team capacity and commitments',
          'Review definition of done',
        ],
        velocityUsed: velocityAvg,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-sprint-planning function:', error);
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