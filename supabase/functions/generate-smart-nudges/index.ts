import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const inputSchema = z.object({
  projectId: z.string().uuid(),
});

const rateLimiter = new Map<string, { count: number; resetAt: number }>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized: Missing authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized: Invalid token');

    // Rate limit: 5 per minute
    const now = Date.now();
    const userLimit = rateLimiter.get(user.id);
    if (!userLimit || now > userLimit.resetAt) {
      rateLimiter.set(user.id, { count: 1, resetAt: now + 60000 });
    } else if (userLimit.count >= 5) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((userLimit.resetAt - now) / 1000)} seconds`);
    } else {
      userLimit.count++;
    }

    const rawInput = await req.json();
    const { projectId } = inputSchema.parse(rawInput);

    // Gather comprehensive context data for pattern analysis
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [
      blockedItems, staleItems, allActiveItems, activeSprint,
      teamMembers, recentActivity, completedRecently,
      previousNudges, sprintHistory, retroInsights
    ] = await Promise.all([
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, status, updated_at, story_points, priority, sprint_id')
        .eq('project_id', projectId)
        .eq('status', 'blocked'),
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, status, updated_at, story_points, priority')
        .eq('project_id', projectId)
        .eq('status', 'in_progress')
        .lt('updated_at', threeDaysAgo),
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, status, updated_at, story_points, priority, created_at')
        .eq('project_id', projectId)
        .in('status', ['todo', 'in_progress', 'blocked', 'in_review']),
      supabase.from('native_sprints')
        .select('id, name, end_date, start_date, status, goal')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .single(),
      supabase.from('project_members')
        .select('user_id, role')
        .eq('project_id', projectId),
      supabase.from('item_activity_log')
        .select('item_id, action, created_at, user_id')
        .eq('project_id', projectId)
        .gte('created_at', twoWeeksAgo)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, story_points, updated_at')
        .eq('project_id', projectId)
        .eq('status', 'done')
        .gte('updated_at', twoWeeksAgo),
      supabase.from('smart_nudges')
        .select('nudge_type, is_dismissed, created_at, severity')
        .eq('project_id', projectId)
        .gte('created_at', twoWeeksAgo),
      supabase.from('native_sprints')
        .select('id, name, start_date, end_date, status')
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .order('end_date', { ascending: false })
        .limit(3),
      supabase.from('project_knowledge_base')
        .select('title, content, content_type')
        .eq('project_id', projectId)
        .in('content_type', ['retro_insight', 'standup_summary', 'sprint_review'])
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Build team pattern context
    const activityByUser = new Map<string, { actions: number; lastActive: string }>();
    for (const log of (recentActivity.data || [])) {
      const existing = activityByUser.get(log.user_id) || { actions: 0, lastActive: log.created_at };
      existing.actions++;
      activityByUser.set(log.user_id, existing);
    }

    const assigneeWorkload = new Map<string, { total: number; blocked: number; stale: number; inProgress: number }>();
    for (const item of (allActiveItems.data || [])) {
      if (item.assignee_id) {
        const w = assigneeWorkload.get(item.assignee_id) || { total: 0, blocked: 0, stale: 0, inProgress: 0 };
        w.total++;
        if (item.status === 'blocked') w.blocked++;
        if (item.status === 'in_progress') w.inProgress++;
        assigneeWorkload.set(item.assignee_id, w);
      }
    }
    for (const item of (staleItems.data || [])) {
      if (item.assignee_id) {
        const w = assigneeWorkload.get(item.assignee_id) || { total: 0, blocked: 0, stale: 0, inProgress: 0 };
        w.stale++;
        assigneeWorkload.set(item.assignee_id, w);
      }
    }

    // Compute sprint health metrics
    const sprintDaysLeft = activeSprint.data?.end_date
      ? Math.floor((new Date(activeSprint.data.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const sprintTotalDays = activeSprint.data?.start_date && activeSprint.data?.end_date
      ? Math.floor((new Date(activeSprint.data.end_date).getTime() - new Date(activeSprint.data.start_date).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const sprintProgressPct = sprintTotalDays && sprintTotalDays > 0
      ? Math.round(((sprintTotalDays - (sprintDaysLeft || 0)) / sprintTotalDays) * 100)
      : null;
    const completedCount = (completedRecently.data || []).length;
    const activeCount = (allActiveItems.data || []).length;
    const completionRatio = activeCount + completedCount > 0
      ? Math.round((completedCount / (activeCount + completedCount)) * 100)
      : 0;

    // Build AI prompt with full team context
    const contextSummary = {
      sprint: activeSprint.data ? {
        name: activeSprint.data.name,
        goal: activeSprint.data.goal,
        daysLeft: sprintDaysLeft,
        totalDays: sprintTotalDays,
        progressPct: sprintProgressPct,
      } : null,
      items: {
        active: activeCount,
        blocked: (blockedItems.data || []).length,
        stale: (staleItems.data || []).length,
        completedThisPeriod: completedCount,
        completionRatio: completionRatio,
      },
      blockedItems: (blockedItems.data || []).slice(0, 5).map(i => ({ title: i.title, daysSinceUpdate: Math.floor((Date.now() - new Date(i.updated_at).getTime()) / 86400000) })),
      staleItems: (staleItems.data || []).slice(0, 5).map(i => ({ title: i.title, daysSinceUpdate: Math.floor((Date.now() - new Date(i.updated_at).getTime()) / 86400000) })),
      teamPatterns: {
        memberCount: (teamMembers.data || []).length,
        workloadDistribution: Array.from(assigneeWorkload.entries()).map(([uid, w]) => ({
          userId: uid,
          ...w,
        })),
        activityLevels: Array.from(activityByUser.entries()).map(([uid, a]) => ({
          userId: uid,
          recentActions: a.actions,
        })),
      },
      previousSprints: (sprintHistory.data || []).map(s => ({ name: s.name })),
      recentInsights: (retroInsights.data || []).slice(0, 3).map(r => r.content?.substring(0, 200)),
      dismissedNudgeTypes: (previousNudges.data || []).filter(n => n.is_dismissed).map(n => n.nudge_type),
    };

    // Call AI to generate contextual, colleague-style nudges
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    let aiNudges: Array<{
      nudge_type: string;
      title: string;
      message: string;
      severity: string;
      category: string;
      suggested_action: string;
      related_item_id?: string;
      related_item_type?: string;
    }> = [];

    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch('https://ai.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are a thoughtful Scrum Master colleague who observes team patterns and offers practical, empathetic advice. Your nudges should feel like a trusted teammate sharing observations over content: `You are a thoughtful Scrum Master colleague who observes team patterns and offers practical, empathetic advice. Your nudges should feel like a trusted teammate sharing observations over coffee, not a monitoring system generating alerts. system generating alerts.

Rules:
- Speak in first person plural ("I've noticed we...", "Our team tends to...")
- Be specific about patterns, not just symptoms
- Always include a concrete suggested action
- Reference team dynamics, not just individual items
- Identify process improvement opportunities
- Keep each nudge under 80 words
- Severity: "info" for observations, "warning" for emerging risks, "urgent" for immediate action needed
- Category must be one of: "process", "velocity", "collaboration", "capacity", "quality", "ceremony"
- Generate 3-8 nudges maximum
- Never include PII or actual user IDs in messages
- If the user previously dismissed certain nudge types, de-prioritise those

Respond ONLY with a JSON array of nudge objects with keys: nudge_type, title, message, severity, category, suggested_action`
              },
              {
                role: 'user',
                content: `Here's the current team context. Analyse patterns and generate contextual nudges:\n\n${JSON.stringify(contextSummary, null, 2)}`
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          // Extract JSON from response (handle markdown code blocks)
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            aiNudges = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (aiErr) {
        console.error('AI nudge generation failed, falling back to rules:', aiErr);
      }
    }

    // Fallback: rule-based nudges if AI is unavailable or returns empty
    if (aiNudges.length === 0) {
      // Blocked items
      for (const item of (blockedItems.data || [])) {
        aiNudges.push({
          nudge_type: 'blocked_item',
          title: `Blocked: ${item.title}`,
          message: `"${item.title}" has been blocked. Let's review dependencies and remove blockers to keep the sprint on track.`,
          severity: 'urgent',
          category: 'velocity',
          suggested_action: 'Review blockers in standup and assign an owner to resolve',
          related_item_id: item.id,
          related_item_type: 'backlog_item',
        });
      }

      // Stale items
      for (const item of (staleItems.data || [])) {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(item.updated_at).getTime()) / 86400000);
        aiNudges.push({
          nudge_type: 'stale_item',
          title: `Stale: ${item.title}`,
          message: `"${item.title}" hasn't been updated in ${daysSinceUpdate} days. A quick status check might surface hidden blockers.`,
          severity: daysSinceUpdate > 5 ? 'warning' : 'info',
          category: 'process',
          suggested_action: 'Ping the assignee or discuss in daily standup',
          related_item_id: item.id,
          related_item_type: 'backlog_item',
        });
      }

      // Sprint ending
      if (sprintDaysLeft !== null && sprintDaysLeft <= 2 && sprintDaysLeft >= 0) {
        aiNudges.push({
          nudge_type: 'sprint_ending',
          title: `Sprint ends ${sprintDaysLeft === 0 ? 'today' : `in ${sprintDaysLeft} day${sprintDaysLeft !== 1 ? 's' : ''}`}`,
          message: `With ${activeCount} items still active, let's prioritise what can realistically be completed and move the rest to the backlog.`,
          severity: sprintDaysLeft === 0 ? 'urgent' : 'warning',
          category: 'velocity',
          suggested_action: 'Hold a quick scope check with the team',
        });
      }

      // Capacity imbalance
      const workloads = Array.from(assigneeWorkload.values());
      if (workloads.length > 1) {
        const maxLoad = Math.max(...workloads.map(w => w.total));
        const minLoad = Math.min(...workloads.map(w => w.total));
        if (maxLoad - minLoad >= 3) {
          aiNudges.push({
            nudge_type: 'capacity_imbalance',
            title: 'Workload imbalance detected',
            message: `I've noticed some team members have ${maxLoad} items while others have ${minLoad}. Redistributing could improve our flow and reduce burnout risk.`,
            severity: 'warning',
            category: 'capacity',
            suggested_action: 'Discuss workload redistribution in the next standup',
          });
        }
      }

      // Low completion ratio
      if (sprintProgressPct && sprintProgressPct > 50 && completionRatio < 30) {
        aiNudges.push({
          nudge_type: 'low_velocity',
          title: 'Sprint velocity trailing',
          message: `We're ${sprintProgressPct}% through the sprint but only ${completionRatio}% of items are complete. Might be worth reviewing if scope needs adjusting.`,
          severity: 'warning',
          category: 'velocity',
          suggested_action: 'Consider a mid-sprint scope review',
        });
      }
    }

    // Map AI nudges to all team members (for non-item-specific nudges)
    const nudgesToInsert: Array<Record<string, unknown>> = [];
    const members = (teamMembers.data || []).map(m => m.user_id);

    for (const nudge of aiNudges) {
      // Item-specific nudges go to the assignee or current user
      if (nudge.related_item_id) {
        const item = [...(blockedItems.data || []), ...(staleItems.data || [])].find(i => i.id === nudge.related_item_id);
        nudgesToInsert.push({
          project_id: projectId,
          user_id: item?.assignee_id || user.id,
          nudge_type: nudge.nudge_type,
          title: nudge.title,
          message: nudge.message,
          severity: nudge.severity,
          category: nudge.category,
          suggested_action: nudge.suggested_action,
          related_item_id: nudge.related_item_id,
          related_item_type: nudge.related_item_type,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        // Team-wide nudges go to the requesting user
        nudgesToInsert.push({
          project_id: projectId,
          user_id: user.id,
          nudge_type: nudge.nudge_type,
          title: nudge.title,
          message: nudge.message,
          severity: nudge.severity,
          category: nudge.category,
          suggested_action: nudge.suggested_action,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Deduplicate against existing unread nudges
    const { data: existingNudges } = await supabase
      .from('smart_nudges')
      .select('nudge_type, related_item_id, user_id')
      .eq('project_id', projectId)
      .eq('is_read', false)
      .eq('is_dismissed', false);

    const existingSet = new Set(
      (existingNudges || []).map(n => `${n.nudge_type}:${n.related_item_id || ''}:${n.user_id}`)
    );

    const newNudges = nudgesToInsert.filter(n =>
      !existingSet.has(`${n.nudge_type}:${n.related_item_id || ''}:${n.user_id}`)
    );

    if (newNudges.length > 0) {
      const { error: insertError } = await supabase
        .from('smart_nudges')
        .insert(newNudges);
      if (insertError) console.error('Failed to insert nudges:', insertError);
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'generate-smart-nudges',
      model: aiNudges.length > 0 && LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'rule-engine',
      tokens_used: aiNudges.length > 0 && LOVABLE_API_KEY ? 500 : 0,
      status: 'success',
      project_id: projectId,
    });

    return new Response(
      JSON.stringify({
        generated: newNudges.length,
        skippedDuplicates: nudgesToInsert.length - newNudges.length,
        aiPowered: !!(LOVABLE_API_KEY && aiNudges.length > 0),
        nudges: newNudges,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-smart-nudges:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
