import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { generateEmbedding, vectorToSql } from "../_shared/rag-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized: Missing authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized: Invalid token');

    const body = await req.json();
    const { 
      projectId, 
      query, 
      matchCount = 5, 
      similarityThreshold = 0.25,
      contentTypes = null 
    } = body;

    if (!projectId || !query) {
      throw new Error('Missing required fields: projectId, query');
    }

    if (query.length > 2000) {
      throw new Error('Query too long (max 2000 characters)');
    }

    // Verify project membership
    const { data: membership } = await userClient
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      throw new Error('Unauthorized: Not a project member');
    }

    console.log(`RAG Retrieve: "${query.slice(0, 80)}..." for project ${projectId}`);

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query, LOVABLE_API_KEY);
    const embeddingStr = vectorToSql(queryEmbedding);

    // Run hybrid search using service role (to access vector operations)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: results, error: searchError } = await serviceClient
      .rpc('search_project_knowledge', {
        query_embedding: embeddingStr,
        query_text: query,
        target_project_id: projectId,
        match_count: Math.min(matchCount, 20),
        similarity_threshold: similarityThreshold,
        content_types: contentTypes,
      });

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error('Knowledge search failed');
    }

    // Format results for agent consumption
    const context = (results || []).map((r: any) => ({
      id: r.id,
      type: r.content_type,
      title: r.title,
      content: r.content,
      metadata: r.metadata,
      relevance: {
        vectorSimilarity: Math.round(r.similarity * 100) / 100,
        textRank: Math.round(r.text_rank * 1000) / 1000,
        combinedScore: Math.round(r.combined_score * 100) / 100,
      },
      createdAt: r.created_at,
    }));

    // Build a text summary for direct prompt injection
    const contextSummary = context.length > 0
      ? context.map((c: any) => 
          `[${c.type.toUpperCase()}] ${c.title} (relevance: ${c.relevance.combinedScore})\n${c.content}`
        ).join('\n\n---\n\n')
      : 'No relevant historical context found.';

    console.log(`RAG Retrieve: Found ${context.length} results`);

    return new Response(
      JSON.stringify({
        success: true,
        results: context,
        contextSummary,
        resultCount: context.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG Retrieve error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        contextSummary: '',
        resultCount: 0,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
