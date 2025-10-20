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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px;">
        <h1 style="color: #0066cc;">Sprint ${sprintNumber} Planning Meeting</h1>
        
        <div style="background: #f0f8ff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
          <h3 style="margin-top: 0;">🎯 Sprint Goal</h3>
          <p style="font-size: 16px; font-weight: 500;">${sprintGoal}</p>
        </div>

        <h2>📋 Meeting Agenda</h2>
        ${agendaHtml}

        ${jiraBacklogUrl ? `
        <div style="margin: 30px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">🔗 Resources</h3>
          <p><strong>JIRA Board:</strong> <a href="${jiraBacklogUrl}" style="color: #0066cc;">${jiraBacklogUrl}</a></p>
          <p style="font-size: 14px; color: #666;">Review prioritized backlog items before the meeting</p>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50;">
          <h3 style="margin-top: 0;">💡 Preparation Tips</h3>
          <ul>
            <li>Review the backlog items linked in JIRA</li>
            <li>Come prepared with questions about unclear requirements</li>
            <li>Consider technical dependencies and risks</li>
            <li>Be ready to discuss capacity and commitments</li>
          </ul>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          This meeting is part of our Agile sprint cycle. Please arrive on time and come prepared.
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