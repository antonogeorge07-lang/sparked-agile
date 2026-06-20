import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { generateEmbedding, vectorToSql } from "../_shared/rag-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VALID_CONTENT_TYPES = [
  'retro_insight', 'decision', 'lesson_learned', 
  'sprint_summary', 'action_item', 'standup_insight', 'workflow_output'
];

// 🔐 Enforced explicit global 'Request' binding to eliminate parameter type implicitly 'any' error (7006)
serve(async (req: Request) => {
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
    const { projectId, contentType, title, content, metadata, sourceId } = body;

    // Validate input
    if (!projectId || !contentType || !title || !content) {
      throw new Error('Missing required fields: projectId, contentType, title, content');
    }

    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      throw new Error(`Invalid contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`);
    }

    if (content.length > 50000) {
      throw new Error('Content too large (max 50KB)');
    }

    // Verify project membership
    const { data: membership, error: memberError } = await userClient
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      throw new Error('Unauthorized: Not a project member');
    }

    console.log(`RAG Ingest: ${contentType} for project ${projectId}`);

    // Generate semantic embedding
    const embedding = await generateEmbedding(`${title}\n\n${content}`, LOVABLE_API_KEY);
    const embeddingStr = vectorToSql(embedding);

    // Store in knowledge base using service role (to handle vector type)
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: inserted, error: insertError } = await serviceClient
      .from('project_knowledge_base')
      .insert({
        project_id: projectId,
        content_type: contentType,
        title,
        content: content.slice(0, 10000), // Cap stored content
        metadata: metadata || {},
        embedding: embeddingStr,
        source_id: sourceId || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to store knowledge entry');
    }

    console.log(`RAG Ingest complete: ${inserted.id}`);

    return new Response(
      JSON.stringify({ success: true, id: inserted.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('RAG Ingest error:', error);
    // 🔐 Solved strict 'unknown' error extraction block constraint (18046)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});