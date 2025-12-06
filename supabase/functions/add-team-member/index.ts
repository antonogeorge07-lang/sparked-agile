import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
const addTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  projectId: z.string().uuid("Invalid project ID format"),
  projectName: z.string().min(1).max(200),
  role: z.enum(['member', 'admin', 'viewer']).optional(),
  accessToken: z.string().optional(),
  grantJiraAccess: z.boolean().optional(),
  grantGithubAccess: z.boolean().optional(),
  grantTeamsAccess: z.boolean().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Authenticate user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Rate limiting: 30 requests per minute for data operations
    checkRateLimit(user.id, 30, 60000);

    // Validate input
    const rawInput = await req.json();
    const validatedInput = addTeamMemberSchema.parse(rawInput);

    const {
      name,
      email,
      projectId,
      projectName,
      role = 'member',
      accessToken,
      grantJiraAccess = false,
      grantGithubAccess = false,
      grantTeamsAccess = false
    } = validatedInput;

    console.log('Adding team member:', { name, email, projectId });

    // Verify user has permission to add team members to this project
    const { data: projectMember, error: memberCheckError } = await supabaseClient
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    if (memberCheckError || !projectMember) {
      throw new Error('Unauthorized: You are not a member of this project');
    }

    // Add team member to database
    const { data: teamMember, error: insertError } = await supabaseClient
      .from('team_members')
      .insert({
        project_id: projectId,
        name,
        email,
        role,
        jira_access: grantJiraAccess,
        github_access: grantGithubAccess,
        teams_access: grantTeamsAccess,
        added_by: user.id,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting team member:', insertError);
      throw new Error(`Failed to add team member: ${insertError.message}`);
    }

    console.log('Team member added successfully:', teamMember.id);

    // Add to Outlook calendar invites if access token provided
    if (accessToken) {
      console.log('Adding team member to Outlook calendar ceremonies...');
      
      // Fetch ceremony configs for this project
      const { data: workspaces } = await supabaseClient
        .from('project_workspaces')
        .select('id')
        .eq('project_id', projectId);

      if (workspaces && workspaces.length > 0) {
        const workspaceId = workspaces[0].id;
        
        const { data: ceremonies } = await supabaseClient
          .from('ceremony_configs')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('is_active', true);

        if (ceremonies && ceremonies.length > 0) {
          // Add attendee to each ceremony event
          for (const ceremony of ceremonies) {
            if (ceremony.outlook_event_id) {
              try {
                // Update the Outlook event to add the new attendee
                const updateResponse = await fetch(
                  `https://graph.microsoft.com/v1.0/me/events/${ceremony.outlook_event_id}`,
                  {
                    method: 'PATCH',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      attendees: [
                        ...(ceremony.attendees || []).map((att: string) => ({
                          emailAddress: { address: att },
                          type: 'required'
                        })),
                        {
                          emailAddress: { address: email },
                          type: 'required'
                        }
                      ]
                    }),
                  }
                );

                if (updateResponse.ok) {
                  console.log(`Added ${email} to ${ceremony.ceremony_type} ceremony`);
                } else {
                  const errorText = await updateResponse.text();
                  console.error(`Failed to add attendee to ${ceremony.ceremony_type}:`, errorText);
                }
              } catch (error) {
                console.error(`Error updating ceremony ${ceremony.ceremony_type}:`, error);
              }
            }
          }
        }
      }
    }

    // Escape user-provided content for HTML email
    const safeName = escapeHtml(name);
    const safeProjectName = escapeHtml(projectName);

    // Send welcome email via Resend REST API (no npm dependency)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    const welcomeEmailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #333;">
        <h1 style="color: #0066cc; font-size: 24px; margin-bottom: 20px;">Welcome to ${safeProjectName}! 🎉</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          Dear ${safeName},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          You've been added to the <strong>${safeProjectName}</strong> team. We're excited to have you on board!
        </p>

        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #0066cc; font-size: 18px;">Your Access</h3>
          <ul style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
            ${grantJiraAccess ? '<li>✅ JIRA Board Access</li>' : ''}
            ${grantGithubAccess ? '<li>✅ GitHub Repository Access</li>' : ''}
            ${grantTeamsAccess ? '<li>✅ Microsoft Teams Channel Access</li>' : ''}
            <li>✅ All Scrum Ceremony Invites</li>
          </ul>
        </div>

        <div style="background: #fff9e6; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #333; font-size: 18px;">🤝 Our Scrum Culture</h3>
          <p style="font-size: 15px; line-height: 1.6; margin: 10px 0;">
            We follow Agile methodologies with:
          </p>
          <ul style="font-size: 15px; line-height: 1.8; padding-left: 20px;">
            <li><strong>Sprint Planning:</strong> Setting goals and commitments</li>
            <li><strong>Daily Scrum:</strong> Quick syncs to stay aligned</li>
            <li><strong>Sprint Review:</strong> Showcasing completed work</li>
            <li><strong>Sprint Retrospective:</strong> Continuous improvement</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          You'll receive calendar invites for all ceremonies. Please review JIRA items before Sprint Planning to make our sessions more productive.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 10px 0; font-weight: 500;">
          Let's build something amazing together! 🚀
        </p>

        <p style="font-size: 15px; color: #666; margin: 5px 0 30px 0;">
          – Your AI Scrum Master 🤖
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="font-size: 14px; color: #888; line-height: 1.5;">
          If you have any questions, feel free to reach out to your Scrum Master or team lead.
        </p>
      </div>
    `;

    try {
      if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured; skipping welcome email');
      } else {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Scrum Master AI <onboarding@resend.dev>',
            to: [email],
            subject: `Welcome to ${safeProjectName}! 🎉`,
            html: welcomeEmailHtml,
          }),
        });

        if (!emailRes.ok) {
          const text = await emailRes.text();
          console.error('Resend API error:', emailRes.status, text);
        } else {
          console.log('Welcome email sent successfully');
        }
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        teamMember,
        message: 'Team member added successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in add-team-member function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});