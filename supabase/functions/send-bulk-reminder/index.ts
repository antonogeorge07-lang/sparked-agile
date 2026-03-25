import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
const bulkReminderSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
  ceremonyType: z.enum(['standup', 'retrospective', 'sprint_planning', 'sprint_review', 'backlog_refinement'], {
    errorMap: () => ({ message: "Invalid ceremony type" })
  }),
  message: z.string().max(2000, "Message must be less than 2000 characters").optional(),
  subject: z.string().max(200, "Subject must be less than 200 characters").optional(),
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
      throw new Error('Unauthorized');
    }

    // Rate limiting: 5 requests per hour for email functions
    checkRateLimit(user.id, 5, 3600000);

    // Validate input
    const rawInput = await req.json();
    const { projectId, ceremonyType, message, subject } = bulkReminderSchema.parse(rawInput);

    console.log('Sending bulk reminder for project:', projectId, 'ceremony:', ceremonyType);

    // Get project name
    const { data: project } = await supabaseClient
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();

    // Get all team members for the project
    const { data: members, error: membersError } = await supabaseClient
      .from('team_members')
      .select('name, email')
      .eq('project_id', projectId);

    if (membersError) {
      throw new Error(`Failed to fetch team members: ${membersError.message}`);
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No team members found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Escape user-provided content
    const safeProjectName = escapeHtml(project?.name || 'Your Project');
    const safeMessage = message ? escapeHtml(message) : null;

    // Get ceremony template
    const ceremonyTemplates = {
      standup: {
        subject: `📅 Daily Standup Reminder - ${safeProjectName}`,
        emoji: '🗣️',
        title: 'Daily Standup',
        description: 'Time for your daily standup!'
      },
      retrospective: {
        subject: `🔄 Sprint Retrospective Reminder - ${safeProjectName}`,
        emoji: '🔄',
        title: 'Sprint Retrospective',
        description: 'Time to reflect on the sprint and improve!'
      },
      sprint_planning: {
        subject: `📋 Sprint Planning Reminder - ${safeProjectName}`,
        emoji: '📋',
        title: 'Sprint Planning',
        description: 'Time to plan the next sprint!'
      },
      sprint_review: {
        subject: `🎯 Sprint Review Reminder - ${safeProjectName}`,
        emoji: '🎯',
        title: 'Sprint Review',
        description: 'Time to showcase our work!'
      },
      backlog_refinement: {
        subject: `🔍 Backlog Refinement Reminder - ${safeProjectName}`,
        emoji: '🔍',
        title: 'Backlog Refinement',
        description: 'Time to refine our backlog!'
      }
    };

    const template = ceremonyTemplates[ceremonyType as keyof typeof ceremonyTemplates] || ceremonyTemplates.standup;

    // Send emails to all members
    const emailPromises = members.map(async (member) => {
      if (!member.email) return null;

      const safeMemberName = escapeHtml(member.name || 'Team Member');

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
            
            ${safeMessage ? `
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; color: #1f2937; line-height: 1.6;">${safeMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                <strong>Project:</strong> ${safeProjectName}<br/>
                <strong>Ceremony:</strong> ${template.title}
              </p>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
              This is an automated reminder from Scrum Master AI
            </p>
          </div>
        </div>
      `;

      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Scrum Master AI <onboarding@resend.dev>',
            to: [member.email],
            subject: subject ? escapeHtml(subject) : template.subject,
            html: emailHtml,
          }),
        });

        if (!emailRes.ok) {
          const text = await emailRes.text();
          console.error(`Failed to send email to ${member.email}:`, emailRes.status, text);
          return { email: member.email, success: false };
        }

        console.log(`Email sent successfully to ${member.email}`);
        return { email: member.email, success: true };
      } catch (error) {
        console.error(`Error sending email to ${member.email}:`, error);
        return { email: member.email, success: false };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r?.success).length;
    const totalCount = members.filter(m => m.email).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount}/${totalCount} reminders successfully`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-bulk-reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});