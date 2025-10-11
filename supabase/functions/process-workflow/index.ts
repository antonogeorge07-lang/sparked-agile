import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { workflowType, projectId, inputData } = await req.json();
    console.log('Processing workflow:', workflowType, 'for project:', projectId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const startTime = Date.now();

    // Create workflow execution record
    const { data: workflowExecution, error: workflowError } = await supabase
      .from('workflow_executions')
      .insert({
        project_id: projectId,
        workflow_type: workflowType,
        input_data: inputData,
        status: 'processing'
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    let systemPrompt = '';
    let userPrompt = '';
    let actionItems: any[] = [];

    // Define workflow-specific prompts
    switch (workflowType) {
      case 'standup_analysis':
        systemPrompt = `You are an AI assistant that analyzes daily standup updates and extracts actionable items. 
        Focus on identifying blockers, impediments, and tasks that need attention.`;
        userPrompt = `Analyze these standup updates and extract action items with priority levels:
        ${JSON.stringify(inputData.updates, null, 2)}
        
        For each blocker or important item, create an action item with:
        - title: Brief description
        - description: Detailed context
        - priority: low, medium, high, or critical
        
        Return a JSON array of action items.`;
        break;

      case 'sprint_extraction':
        systemPrompt = `You are an AI assistant that analyzes sprint summaries and generates insights.
        Extract key achievements, identify patterns, and suggest improvements.`;
        userPrompt = `Analyze this sprint data and provide insights:
        ${JSON.stringify(inputData, null, 2)}
        
        Provide:
        1. Key achievements (array of strings)
        2. Blockers identified (array of strings)
        3. AI insights and recommendations (text)
        4. Action items for next sprint (array with title, description, priority)
        
        Return as JSON.`;
        break;

      case 'retro_insights':
        systemPrompt = `You are an AI assistant that analyzes retrospective feedback and identifies themes.
        Look for patterns across team feedback and suggest actionable improvements.`;
        userPrompt = `Analyze this retrospective feedback:
        ${JSON.stringify(inputData.feedback, null, 2)}
        
        Provide:
        1. Common themes (array of strings)
        2. Action items to address concerns (array with title, description, priority)
        3. Positive patterns to continue (array of strings)
        
        Return as JSON.`;
        break;

      default:
        throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    // Call Lovable AI
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
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI processing failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('AI response:', content);
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Extract and store action items
    if (parsedResult.actionItems || parsedResult.action_items) {
      const items = parsedResult.actionItems || parsedResult.action_items;
      for (const item of items) {
        const { error: itemError } = await supabase
          .from('action_items')
          .insert({
            project_id: projectId,
            title: item.title,
            description: item.description || '',
            priority: item.priority || 'medium',
            source_type: workflowType.split('_')[0],
            source_id: workflowExecution.id
          });
        
        if (itemError) {
          console.error('Error inserting action item:', itemError);
        } else {
          actionItems.push(item);
        }
      }
    }

    const executionTime = Date.now() - startTime;

    // Update workflow execution with results
    const { error: updateError } = await supabase
      .from('workflow_executions')
      .update({
        output_data: parsedResult,
        status: 'completed',
        execution_time_ms: executionTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', workflowExecution.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        workflowId: workflowExecution.id,
        result: parsedResult,
        actionItems: actionItems,
        executionTime: executionTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Workflow processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
