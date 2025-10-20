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
      achievedObjectives,
      demoChecklist,
      stakeholders,
      startDateTime,
      durationMinutes = 60,
      jiraBoardUrl,
    } = await req.json();

    console.log(`Creating Sprint ${sprintNumber} Review invite`);

    if (!accessToken) {
      throw new Error('Microsoft access token required');
    }

    // Format demo checklist for email
    const checklistHtml = demoChecklist
      .map((item: string, idx: number) => `<li style="margin: 10px 0;">${item}</li>`)
      .join('');

    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px;">
        <h1 style="color: #0066cc;">Sprint ${sprintNumber} Review</h1>
        
        <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
          <h3 style="margin-top: 0;">✅ What We Achieved</h3>
          <p style="font-size: 16px; line-height: 1.6;">${achievedObjectives}</p>
        </div>

        <h2>📋 Demo Agenda</h2>
        <ol style="line-height: 1.8; font-size: 15px;">
          ${checklistHtml}
        </ol>

        ${jiraBoardUrl ? `
        <div style="margin: 30px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">🔗 Reference Links</h3>
          <p><strong>JIRA Board:</strong> <a href="${jiraBoardUrl}" style="color: #0066cc;">${jiraBoardUrl}</a></p>
          <p style="font-size: 14px; color: #666;">View all completed tickets and sprint details</p>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 15px; background: #f0f8ff; border-left: 4px solid #0066cc;">
          <h3 style="margin-top: 0;">💡 Meeting Format</h3>
          <ul style="line-height: 1.8;">
            <li><strong>Demo (40 min):</strong> Live demonstration of completed features</li>
            <li><strong>Q&A (15 min):</strong> Questions and feedback from stakeholders</li>
            <li><strong>Next Steps (5 min):</strong> Brief overview of upcoming sprint</li>
          </ul>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          We look forward to showcasing the great work delivered this sprint. Please come prepared with questions and feedback!
        </p>
      </div>
    `;

    // Parse stakeholders
    const stakeholdersList = Array.isArray(stakeholders) 
      ? stakeholders 
      : stakeholders.split(',').map((email: string) => email.trim()).filter(Boolean);

    const eventData = {
      subject: `Sprint ${sprintNumber} Review - Demo & Feedback Session`,
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
      attendees: stakeholdersList.map((email: string) => ({
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
    console.log('Successfully created Sprint Review event:', eventResult.id);

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
    console.error('Error in create-review-outlook-invite function:', error);
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