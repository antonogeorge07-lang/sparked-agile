import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { epicId, type } = await req.json()
    
    if (!epicId || !type) {
      return new Response(
        JSON.stringify({ error: 'Epic ID and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch epic data with related information
    const { data: epicData, error: epicError } = await supabase
      .from('epics')
      .select(`
        *,
        value_streams(name),
        features(id, title, status, description),
        epic_milestones(title, status, target_date, completion_date),
        epic_progress_snapshots(snapshot_date, completion_percentage, velocity)
      `)
      .eq('id', epicId)
      .single()

    if (epicError) throw epicError

    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'closure_summary') {
      systemPrompt = `You are an expert project manager analyzing epic completion. Generate a concise closure summary that highlights achievements, challenges overcome, and final deliverables.`
      
      userPrompt = `Epic: "${epicData.title}"
Description: ${epicData.description || 'N/A'}
Value Stream: ${epicData.value_streams?.name || 'N/A'}
Status: ${epicData.status}
Priority: ${epicData.priority}
Business Value: ${epicData.business_value || 'N/A'}
Start Date: ${epicData.start_date || 'N/A'}
End Date: ${epicData.end_date || 'N/A'}
Health Score: ${epicData.health_score || 'N/A'}

Features (${epicData.features?.length || 0} total):
${epicData.features?.map((f: any) => `- ${f.title} (${f.status})`).join('\n') || 'No features'}

Milestones (${epicData.epic_milestones?.length || 0} total):
${epicData.epic_milestones?.map((m: any) => `- ${m.title} (${m.status})`).join('\n') || 'No milestones'}

Generate a professional closure summary (200-300 words) covering:
1. What was achieved
2. Key deliverables completed
3. Challenges overcome
4. Business value delivered
5. Final status and outcomes

Write in a professional, executive-summary style.`

    } else if (type === 'lessons_learned') {
      systemPrompt = `You are an expert retrospective facilitator. Analyze the epic's journey and suggest valuable lessons learned.`
      
      userPrompt = `Epic: "${epicData.title}"
Description: ${epicData.description || 'N/A'}
Duration: ${epicData.start_date && epicData.end_date ? `${epicData.start_date} to ${epicData.end_date}` : 'N/A'}
Health Score: ${epicData.health_score || 'N/A'}
Business Value: ${epicData.business_value || 'N/A'}

Features Completed: ${epicData.features?.filter((f: any) => f.status === 'completed').length || 0} of ${epicData.features?.length || 0}

Milestones:
${epicData.epic_milestones?.map((m: any) => {
  let status = m.status
  if (m.status === 'completed' && m.completion_date) {
    const targetDate = new Date(m.target_date)
    const completionDate = new Date(m.completion_date)
    status = completionDate <= targetDate ? 'completed on time' : 'completed late'
  }
  return `- ${m.title}: ${status}`
}).join('\n') || 'No milestones'}

Progress Snapshots: ${epicData.epic_progress_snapshots?.length || 0} recorded

Based on this epic's journey, suggest 3-5 specific lessons learned in these categories:
1. What went well (celebrate successes)
2. What could be improved (constructive feedback)
3. Process improvements for future epics
4. Technical insights

Format as JSON array:
[
  {
    "category": "Process|Technical|Team|Business",
    "impact": "High|Medium|Low",
    "title": "Brief lesson title",
    "description": "Detailed lesson description (2-3 sentences)"
  }
]

Focus on actionable, specific insights that can improve future epic delivery.`
    }

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const generatedContent = aiData.choices[0]?.message?.content || ''

    // Parse lessons learned if JSON format
    let parsedContent = generatedContent
    if (type === 'lessons_learned') {
      try {
        // Try to extract JSON from the response
        const jsonMatch = generatedContent.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        console.error('Failed to parse lessons learned JSON:', e)
        // Return as-is if parsing fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: parsedContent,
        type 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error generating epic insights:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate insights' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
