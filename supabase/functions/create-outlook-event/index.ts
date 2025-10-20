import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventRequest {
  accessToken: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  attendees: string[];
  body?: string;
  isRecurring?: boolean;
  recurrencePattern?: {
    type: 'daily' | 'weekly' | 'absoluteMonthly';
    interval: number;
    daysOfWeek?: string[];
  };
  recurrenceRange?: {
    type: 'endDate' | 'noEnd';
    startDate: string;
    endDate?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      accessToken,
      subject,
      startDateTime,
      endDateTime,
      attendees,
      body,
      isRecurring,
      recurrencePattern,
      recurrenceRange
    }: EventRequest = await req.json();

    console.log('Creating Outlook event:', { subject, startDateTime, isRecurring });

    if (!accessToken) {
      throw new Error('Access token is required');
    }

    // Build event object
    const event: any = {
      subject,
      body: {
        contentType: 'HTML',
        content: body || `<p>${subject}</p>`,
      },
      start: {
        dateTime: startDateTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'UTC',
      },
      attendees: attendees.map(email => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
    };

    // Add recurrence if specified
    if (isRecurring && recurrencePattern && recurrenceRange) {
      event.recurrence = {
        pattern: recurrencePattern,
        range: recurrenceRange,
      };
    }

    // Create event using Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Microsoft Graph API error:', errorText);
      throw new Error(`Failed to create event: ${response.status} - ${errorText}`);
    }

    const createdEvent = await response.json();
    console.log('Event created successfully:', createdEvent.id);

    return new Response(
      JSON.stringify({
        success: true,
        eventId: createdEvent.id,
        webLink: createdEvent.webLink,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in create-outlook-event function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
