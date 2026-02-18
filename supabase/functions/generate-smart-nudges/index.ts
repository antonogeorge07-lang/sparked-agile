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

    // Gather context data
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [blockedItems, staleItems, overdueTasks, activeSprint, teamMembers] = await Promise.all([
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, status, updated_at')
        .eq('project_id', projectId)
        .eq('status', 'blocked'),
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, status, updated_at')
        .eq('project_id', projectId)
        .eq('status', 'in_progress')
        .lt('updated_at', threeDaysAgo),
      supabase.from('native_backlog_items')
        .select('id, title, assignee_id, status, updated_at')
        .eq('project_id', projectId)
        .in('status', ['todo', 'in_progress'])
        .not('updated_at', 'gt', oneWeekAgo),
      supabase.from('native_sprints')
        .select('id, name, end_date, status')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .single(),
      supabase.from('project_members')
        .select('user_id, role')
        .eq('project_id', projectId),
    ]);

    const nudges: Array<{
      user_id: string;
      nudge_type: string;
      title: string;
      message: string;
      severity: string;
      related_item_id?: string;
      related_item_type?: string;
    }> = [];

    // Generate nudges for blocked items
    for (const item of (blockedItems.data || [])) {
      const targetUser = item.assignee_id || user.id;
      nudges.push({
        user_id: targetUser,
        nudge_type: 'blocked_item',
        title: `Blocked: ${item.title}`,
        message: `"${item.title}" has been blocked. Review dependencies and remove blockers to keep the sprint on track.`,
        severity: 'urgent',
        related_item_id: item.id,
        related_item_type: 'backlog_item',
      });
    }

    // Generate nudges for stale items (no updates in 3+ days)
    for (const item of (staleItems.data || [])) {
      const targetUser = item.assignee_id || user.id;
      const daysSinceUpdate = Math.floor((Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      nudges.push({
        user_id: targetUser,
        nudge_type: 'stale_pr',
        title: `Stale: ${item.title}`,
        message: `"${item.title}" hasn't been updated in ${daysSinceUpdate} days. Consider providing a status update or re-prioritising.`,
        severity: daysSinceUpdate > 5 ? 'warning' : 'info',
        related_item_id: item.id,
        related_item_type: 'backlog_item',
      });
    }

    // Sprint ending soon nudge
    if (activeSprint.data?.end_date) {
      const daysUntilEnd = Math.floor((new Date(activeSprint.data.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilEnd <= 2 && daysUntilEnd >= 0) {
        for (const member of (teamMembers.data || [])) {
          nudges.push({
            user_id: member.user_id,
            nudge_type: 'idle_sprint',
            title: `Sprint ending in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''}`,
            message: `"${activeSprint.data.name}" ends ${daysUntilEnd === 0 ? 'today' : `in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''}`}. Review incomplete items and update statuses.`,
            severity: daysUntilEnd === 0 ? 'urgent' : 'warning',
          });
        }
      }
    }

    // Capacity warning: too many items assigned to one person
    const assigneeCounts = new Map<string, number>();
    for (const item of [...(blockedItems.data || []), ...(staleItems.data || [])]) {
      if (item.assignee_id) {
        assigneeCounts.set(item.assignee_id, (assigneeCounts.get(item.assignee_id) || 0) + 1);
      }
    }
    for (const [assigneeId, count] of assigneeCounts) {
      if (count >= 3) {
        nudges.push({
          user_id: assigneeId,
          nudge_type: 'capacity_warning',
          title: `High workload detected`,
          message: `You have ${count} items that are blocked or stale. Consider redistributing work or requesting support.`,
          severity: 'warning',
        });
      }
    }

    // Deduplicate: don't create nudges that already exist (unread)
    const { data: existingNudges } = await supabase
      .from('smart_nudges')
      .select('nudge_type, related_item_id, user_id')
      .eq('project_id', projectId)
      .eq('is_read', false)
      .eq('is_dismissed', false);

    const existingSet = new Set(
      (existingNudges || []).map(n => `${n.nudge_type}:${n.related_item_id || ''}:${n.user_id}`)
    );

    const newNudges = nudges.filter(n =>
      !existingSet.has(`${n.nudge_type}:${n.related_item_id || ''}:${n.user_id}`)
    );

    // Insert new nudges
    if (newNudges.length > 0) {
      const { error: insertError } = await supabase
        .from('smart_nudges')
        .insert(newNudges.map(n => ({
          ...n,
          project_id: projectId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })));

      if (insertError) console.error('Failed to insert nudges:', insertError);
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'generate-smart-nudges',
      model: 'rule-engine',
      tokens_used: 0,
      status: 'success',
      project_id: projectId,
    });

    return new Response(
      JSON.stringify({
        generated: newNudges.length,
        skippedDuplicates: nudges.length - newNudges.length,
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
