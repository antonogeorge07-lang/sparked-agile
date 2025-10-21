import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddTeamMemberRequest {
  name: string;
  email: string;
  projectId: string;
  projectName: string;
  role?: string;
  accessToken?: string;
  grantJiraAccess?: boolean;
  grantGithubAccess?: boolean;
  grantTeamsAccess?: boolean;
}

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
    }: AddTeamMemberRequest = await req.json();

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

    // Send welcome email
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const welcomeEmailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #333;">
        <h1 style="color: #0066cc; font-size: 24px; margin-bottom: 20px;">Welcome to ${projectName}! 🎉</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          Dear ${name},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          You've been added to the <strong>${projectName}</strong> team. We're excited to have you on board!
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
      await resend.emails.send({
        from: 'Scrum Master AI <onboarding@resend.dev>',
        to: [email],
        subject: `Welcome to ${projectName}! 🎉`,
        html: welcomeEmailHtml,
      });
      console.log('Welcome email sent successfully');
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