import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CEREMONY_TEMPLATES = [
  {
    type: 'Sprint Planning',
    duration: 120,
    startTime: '10:00',
    recurrence: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO',
    description: 'Sprint Planning - Plan the upcoming sprint with the team',
  },
  {
    type: 'Daily Scrum',
    duration: 15,
    startTime: '09:00',
    recurrence: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
    description: 'Daily Scrum - Quick sync with the team',
  },
  {
    type: 'Sprint Review',
    duration: 60,
    startTime: '14:00',
    recurrence: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=FR',
    description: 'Sprint Review - Demo completed work to stakeholders',
  },
  {
    type: 'Sprint Retrospective',
    duration: 90,
    startTime: '15:30',
    recurrence: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=FR',
    description: 'Sprint Retrospective - Reflect and improve team processes',
  },
  {
    type: 'Backlog Refinement',
    duration: 60,
    startTime: '13:00',
    recurrence: 'FREQ=WEEKLY;BYDAY=WE',
    description: 'Backlog Refinement - Groom and prioritize backlog items',
  },
];

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
      projectId,
      workspaceName,
      teamDistributionList,
      accessToken,
      startDate,
    } = await req.json();

    console.log('Initializing workspace:', workspaceName);

    // Create workspace record
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from('project_workspaces')
      .insert({
        project_id: projectId,
        name: workspaceName,
        team_distribution_list: teamDistributionList,
        configuration_status: 'initializing',
      })
      .select()
      .single();

    if (workspaceError) {
      throw workspaceError;
    }

    // Create Outlook ceremonies if access token provided
    const createdCeremonies = [];
    if (accessToken) {
      const attendees = teamDistributionList
        .split(',')
        .map((email: string) => email.trim())
        .filter((email: string) => email.length > 0)
        .map((email: string) => ({
          emailAddress: { address: email },
          type: 'required',
        }));

      for (const ceremony of CEREMONY_TEMPLATES) {
        try {
          const eventData = {
            subject: `${ceremony.type} - ${workspaceName}`,
            body: {
              contentType: 'HTML',
              content: ceremony.description,
            },
            start: {
              dateTime: `${startDate}T${ceremony.startTime}:00`,
              timeZone: 'UTC',
            },
            end: {
              dateTime: `${startDate}T${addMinutes(ceremony.startTime, ceremony.duration)}`,
              timeZone: 'UTC',
            },
            recurrence: {
              pattern: parseRecurrence(ceremony.recurrence),
              range: {
                type: 'noEnd',
                startDate: startDate,
              },
            },
            attendees: attendees,
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

          if (eventResponse.ok) {
            const eventResult = await eventResponse.json();
            
            // Save ceremony config
            await supabaseClient.from('ceremony_configs').insert({
              workspace_id: workspace.id,
              ceremony_type: ceremony.type,
              outlook_event_id: eventResult.id,
              recurrence_pattern: ceremony.recurrence,
              attendees: teamDistributionList.split(',').map((e: string) => e.trim()),
              start_time: ceremony.startTime,
              duration_minutes: ceremony.duration,
            });

            createdCeremonies.push(ceremony.type);
            console.log('Created ceremony:', ceremony.type);
          }
        } catch (error) {
          console.error(`Failed to create ${ceremony.type}:`, error);
        }
      }
    }

    // Update workspace status
    await supabaseClient
      .from('project_workspaces')
      .update({
        configuration_status: 'ready',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspace.id);

    return new Response(
      JSON.stringify({
        success: true,
        workspaceId: workspace.id,
        ceremoniesCreated: createdCeremonies,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in initialize-workspace function:', error);
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

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`;
}

function parseRecurrence(recurrenceStr: string) {
  const parts = recurrenceStr.split(';');
  const pattern: any = {};
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key === 'FREQ') pattern.type = value.toLowerCase();
    if (key === 'INTERVAL') pattern.interval = parseInt(value);
    if (key === 'BYDAY') pattern.daysOfWeek = value.split(',').map(d => d.toLowerCase());
  });
  
  return pattern;
}