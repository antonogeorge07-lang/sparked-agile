import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require service-role auth or cron secret — this function bulk-sends emails
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const cronSecret = Deno.env.get('CRON_SECRET');
    const authHeader = req.headers.get('Authorization');
    const cronHeader = req.headers.get('x-cron-secret');
    const isServiceRole = !!authHeader && authHeader === `Bearer ${serviceRoleKey}`;
    const isCron = !!cronSecret && !!cronHeader && cronHeader === cronSecret;
    if (!isServiceRole && !isCron) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    );

    console.log('Checking for pending scheduled reminders...');

    // Get pending reminders that are due
    const now = new Date().toISOString();
    const { data: reminders, error: remindersError } = await supabaseClient
      .from('ceremony_reminders')
      .select('*, projects(name)')
      .eq('status', 'pending')
      .lte('scheduled_time', now)
      .limit(50);

    if (remindersError) {
      throw new Error(`Failed to fetch reminders: ${remindersError.message}`);
    }

    if (!reminders || reminders.length === 0) {
      console.log('No pending reminders found');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending reminders' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${reminders.length} pending reminders`);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Process each reminder
    const results = await Promise.all(
      reminders.map(async (reminder) => {
        try {
          console.log(`Processing reminder ${reminder.id} for project ${reminder.project_id}`);

          // Get team members for this project
          const { data: members, error: membersError } = await supabaseClient
            .from('team_members')
            .select('name, email')
            .eq('project_id', reminder.project_id);

          if (membersError || !members || members.length === 0) {
            console.error(`No members found for project ${reminder.project_id}`);
            await supabaseClient
              .from('ceremony_reminders')
              .update({ status: 'failed', sent_at: new Date().toISOString() })
              .eq('id', reminder.id);
            return { id: reminder.id, success: false, reason: 'No members found' };
          }

          // Get ceremony template
          const ceremonyTemplates = {
            standup: { emoji: '🗣️', title: 'Daily Standup', description: 'Time for your daily standup!' },
            retrospective: { emoji: '🔄', title: 'Sprint Retrospective', description: 'Time to reflect on the sprint and improve!' },
            sprint_planning: { emoji: '📋', title: 'Sprint Planning', description: 'Time to plan the next sprint!' },
            sprint_review: { emoji: '🎯', title: 'Sprint Review', description: 'Time to showcase our work!' },
            backlog_refinement: { emoji: '🔍', title: 'Backlog Refinement', description: 'Time to refine our backlog!' }
          };

          const template = ceremonyTemplates[reminder.ceremony_type as keyof typeof ceremonyTemplates];
          const projectName = escapeHtml(reminder.projects?.name || 'Your Project');

          // Send emails to all members
          const emailResults = await Promise.all(
            members.map(async (member) => {
              if (!member.email) return null;

              const safeMemberName = escapeHtml(member.name || 'Team Member');
              const safeReminderMessage = reminder.reminder_message 
                ? escapeHtml(reminder.reminder_message) 
                : null;

              const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #333;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 32px;">${template.emoji} ${template.title}</h1>
                  </div>
                  
                  <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                      Hi ${safeMemberName},
                    </p>
                    
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                      ${template.description}
                    </p>
                    
                    ${safeReminderMessage ? `
                      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                        <p style="margin: 0; color: #1f2937; line-height: 1.6;">${safeReminderMessage}</p>
                      </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="font-size: 14px; color: #6b7280; margin: 0;">
                        <strong>Project:</strong> ${projectName}<br/>
                        <strong>Ceremony:</strong> ${template.title}<br/>
                        <strong>Scheduled:</strong> ${new Date(reminder.scheduled_time).toLocaleString()}
                      </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
                      This is an automated reminder from Scrum Master AI
                    </p>
                  </div>
                </div>
              `;

              const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Scrum Master AI <onboarding@resend.dev>',
                  to: [member.email],
                  subject: `${template.emoji} ${template.title} Reminder - ${projectName}`,
                  html: emailHtml,
                }),
              });

              if (!emailRes.ok) {
                const text = await emailRes.text();
                console.error(`Failed to send email to ${member.email}:`, text);
                return false;
              }

              return true;
            })
          );

          const successCount = emailResults.filter(Boolean).length;
          const status = successCount > 0 ? 'sent' : 'failed';

          // Update reminder status
          await supabaseClient
            .from('ceremony_reminders')
            .update({ status, sent_at: new Date().toISOString() })
            .eq('id', reminder.id);

          console.log(`Reminder ${reminder.id}: sent to ${successCount}/${members.length} members`);
          return { id: reminder.id, success: successCount > 0, sent: successCount, total: members.length };
        } catch (error) {
          console.error(`Error processing reminder ${reminder.id}:`, error);
          await supabaseClient
            .from('ceremony_reminders')
            .update({ status: 'failed', sent_at: new Date().toISOString() })
            .eq('id', reminder.id);
          return { id: reminder.id, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    console.log(`Processed ${results.length} reminders, ${successCount} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} reminders, ${successCount} successful`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-scheduled-reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});