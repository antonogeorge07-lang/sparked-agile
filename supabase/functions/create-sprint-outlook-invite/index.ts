import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      throw new Error('User not authenticated');
    }

    const { 
      accessToken,
      sprintNumber,
      agenda,
      sprintGoal,
      jiraBacklogUrl,
      attendees,
      startDateTime,
      durationMinutes = 120,
    } = await req.json();

    console.log(`Creating Outlook invite for Sprint ${sprintNumber} Planning`);

    if (!accessToken) {
      throw new Error('Microsoft access token required');
    }

    // Format agenda for email HTML
    const agendaHtml = agenda
      .split('\n')
      .map((line: string) => {
        if (line.startsWith('#')) {
          return `<h2>${line.replace(/^#+\s*/, '')}</h2>`;
        } else if (line.match(/^\d+\./)) {
          return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
        } else if (line.match(/^[-*•]/)) {
          return `<li>${line.replace(/^[-*•]\s*/, '')}</li>`;
        }
        return line ? `<p>${line}</p>` : '';
      })
      .join('');

    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; color: #333;">
        <h1 style="color: #0066cc; font-size: 24px; margin-bottom: 10px;">📅 Sprint ${sprintNumber} Planning</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          Dear Team,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">
          Let's align our goals and capacity for the upcoming sprint.
        </p>

        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #0066cc; font-size: 18px;">🎯 Sprint Goal</h3>
          <p style="font-size: 16px; font-weight: 500; line-height: 1.5; margin: 10px 0;">${sprintGoal}</p>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
          Please review your ${jiraBacklogUrl ? 'JIRA' : 'backlog'} items beforehand so we can finalise the sprint backlog efficiently.
        </p>

        ${jiraBacklogUrl ? `
        <div style="margin: 25px 0; padding: 18px; background: #fff9e6; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 15px;">
            <strong>📎 Backlog Reference:</strong> <a href="${jiraBacklogUrl}" style="color: #0066cc; text-decoration: none;">${jiraBacklogUrl}</a>
          </p>
        </div>
        ` : ''}

        <h3 style="color: #333; font-size: 18px; margin-top: 30px;">📋 Meeting Agenda</h3>
        ${agendaHtml}

        <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 10px 0; font-weight: 500;">
          Let's plan smart, commit wisely, and deliver with purpose.
        </p>

        <p style="font-size: 15px; color: #666; margin: 5px 0 30px 0;">
          – Your AI Scrum Master 🤖
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <p style="font-size: 14px; color: #888; line-height: 1.5; margin-top: 20px;">
          Looking forward to a productive planning session!
        </p>
      </div>
    `;

    // Parse attendees
    const attendeesList = Array.isArray(attendees) 
      ? attendees 
      : attendees.split(',').map((email: string) => email.trim()).filter(Boolean);

    const eventData = {
      subject: `Sprint ${sprintNumber} Planning - ${sprintGoal}`,
      body: {
        contentType: 'HTML',
        content: emailBody,
      },
      start: {
        dateTime: startDateTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(new Date(startDateTime).getTime() + durationMinutes * 60000).toISOString(),
        timeZone: 'UTC',
      },
      attendees: attendeesList.map((email: string) => ({
        emailAddress: { address: email },
        type: 'required',
      })),
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    };

    const eventResponse = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    if (!eventResponse.ok) {
      const errorText = await eventResponse.text();
      console.error('Microsoft Graph API error:', errorText);
      throw new Error(`Failed to create Outlook event: ${eventResponse.status}`);
    }

    const eventResult = await eventResponse.json();
    console.log('Successfully created Outlook event:', eventResult.id);

    return new Response(
      JSON.stringify({
        success: true,
        eventId: eventResult.id,
        webLink: eventResult.webLink,
        onlineMeeting: eventResult.onlineMeeting,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-sprint-outlook-invite function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});