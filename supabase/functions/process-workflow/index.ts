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
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Create client with user's auth token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Input validation
    const requestBody = await req.json();
    const { workflowType, projectId, inputData } = requestBody;

    if (!workflowType || !projectId || !inputData) {
      throw new Error('Missing required fields: workflowType, projectId, or inputData');
    }

    if (!['standup_analysis', 'sprint_extraction', 'retro_insights'].includes(workflowType)) {
      throw new Error('Invalid workflow type');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      throw new Error('Invalid project ID format');
    }

    // Check input data size
    const inputDataStr = JSON.stringify(inputData);
    if (inputDataStr.length > 50000) {
      throw new Error('Input data too large (max 50KB)');
    }

    // Verify user has access to this project
    const { data: membership, error: memberError } = await supabaseClient
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      throw new Error('Unauthorized: User is not a member of this project');
    }
    console.log('Processing workflow:', workflowType, 'for project:', projectId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      throw new Error('Supabase service role key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    // RAG: Retrieve relevant historical context
    let historicalContext = '';
    try {
      const { generateEmbedding, vectorToSql } = await import("../_shared/rag-utils.ts");
      const queryText = `${workflowType}: ${JSON.stringify(inputData).slice(0, 500)}`;
      const queryEmbedding = await generateEmbedding(queryText, LOVABLE_API_KEY);

      const contentTypeMap: Record<string, string[]> = {
        'standup_analysis': ['standup_insight', 'action_item', 'decision'],
        'sprint_extraction': ['sprint_summary', 'lesson_learned', 'retro_insight'],
        'retro_insights': ['retro_insight', 'lesson_learned', 'decision'],
      };

      const { data: ragResults } = await supabase.rpc('search_project_knowledge', {
        query_embedding: vectorToSql(queryEmbedding),
        query_text: queryText,
        target_project_id: projectId,
        match_count: 5,
        similarity_threshold: 0.25,
        content_types: contentTypeMap[workflowType] || null,
      });

      if (ragResults && ragResults.length > 0) {
        historicalContext = `\n\n--- HISTORICAL PROJECT CONTEXT ---\n` +
          ragResults.map((r: any) => `[${r.content_type}] ${r.title}: ${r.content}`).join('\n\n') +
          `\n--- END CONTEXT ---\n\nLeverage this historical context to identify recurring patterns and provide more targeted insights.`;
        console.log(`RAG: Injected ${ragResults.length} entries into ${workflowType}`);
      }
    } catch (ragError) {
      console.warn('RAG retrieval failed (non-blocking):', ragError);
    }

    let systemPrompt = '';
    let userPrompt = '';
    let actionItems: any[] = [];

    // Define workflow-specific prompts
    switch (workflowType) {
      case 'standup_analysis':
        systemPrompt = `You are an AI assistant that analyzes daily standup updates and extracts actionable items. 
        Focus on identifying blockers, impediments, and tasks that need attention. When historical context is provided, reference past patterns.`;
        userPrompt = `Analyze these standup updates and extract action items with priority levels:
        ${JSON.stringify(inputData.updates, null, 2)}${historicalContext}
        
        For each blocker or important item, create an action item with:
        - title: Brief description
        - description: Detailed context
        - priority: low, medium, high, or critical
        
        Return a JSON array of action items.`;
        break;

      case 'sprint_extraction':
        systemPrompt = `You are an AI assistant that analyzes sprint summaries and generates insights.
        Extract key achievements, identify patterns, and suggest improvements. Reference historical patterns when context is available.`;
        userPrompt = `Analyze this sprint data and provide insights:
        ${JSON.stringify(inputData, null, 2)}${historicalContext}
        
        Provide:
        1. Key achievements (array of strings)
        2. Blockers identified (array of strings)
        3. AI insights and recommendations (text)
        4. Action items for next sprint (array with title, description, priority)
        5. Recurring patterns (if historical context available)
        
        Return as JSON.`;
        break;

      case 'retro_insights':
        systemPrompt = `You are an AI assistant that analyzes retrospective feedback and identifies themes.
        Look for patterns across team feedback and suggest actionable improvements. Track recurring themes from historical context.`;
        userPrompt = `Analyze this retrospective feedback:
        ${JSON.stringify(inputData.feedback, null, 2)}${historicalContext}
        
        Provide:
        1. Common themes (array of strings)
        2. Action items to address concerns (array with title, description, priority)
        3. Positive patterns to continue (array of strings)
        4. Recurring issues from past retrospectives (if context available)
        
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

    // RAG: Ingest workflow output for future retrieval
    try {
      const { generateEmbedding, vectorToSql } = await import("../_shared/rag-utils.ts");
      const contentTypeMap: Record<string, string> = {
        'standup_analysis': 'standup_insight',
        'sprint_extraction': 'sprint_summary',
        'retro_insights': 'retro_insight',
      };

      const summaryContent = JSON.stringify(parsedResult).slice(0, 5000);
      const embedding = await generateEmbedding(summaryContent, LOVABLE_API_KEY);

      await supabase.from('project_knowledge_base').insert({
        project_id: projectId,
        content_type: contentTypeMap[workflowType] || 'workflow_output',
        title: `${workflowType.replace(/_/g, ' ')} - ${new Date().toISOString().split('T')[0]}`,
        content: summaryContent,
        metadata: {
          workflow_id: workflowExecution.id,
          execution_time_ms: executionTime,
          action_items_count: actionItems.length,
        },
        embedding: vectorToSql(embedding),
        source_id: workflowExecution.id,
        created_by: user.id,
      });
      console.log('RAG: Ingested workflow output');
    } catch (ingestError) {
      console.warn('RAG ingestion failed (non-blocking):', ingestError);
    }

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
