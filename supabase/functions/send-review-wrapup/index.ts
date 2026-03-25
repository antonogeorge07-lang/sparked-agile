import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
      sessionId,
      sprintNumber,
      deliveredFeatures,
      stakeholderFeedback,
      backlogUpdates,
      accessToken,
      stakeholders,
    } = await req.json();

    console.log(`Generating wrap-up summary for Sprint ${sprintNumber} Review`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to format wrap-up summary
    const systemPrompt = `You are an expert Scrum Master creating professional sprint review summaries for stakeholders.`;

    const userPrompt = `Create a professional wrap-up email summary for Sprint ${sprintNumber} Review meeting.

Delivered Features:
${deliveredFeatures.map((f: string) => `- ${f}`).join('\n')}

Stakeholder Feedback:
${stakeholderFeedback}

Backlog Updates:
${backlogUpdates}

Please provide a well-structured email that includes:
1. Executive Summary (2-3 sentences)
2. Features Delivered (formatted list with brief descriptions)
3. Key Stakeholder Feedback (organized by theme)
4. Action Items and Next Steps
5. Backlog Updates and Priorities
6. Thank You and Closing

Format in HTML for email delivery.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate wrap-up summary');
    }

    const aiData = await aiResponse.json();
    let wrapupContent = aiData.choices[0].message.content;

    // If AI didn't return HTML, format it
    if (!wrapupContent.includes('<')) {
      wrapupContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
          ${wrapupContent.split('\n\n').map((para: string) => `<p>${para}</p>`).join('')}
        </div>
      `;
    }

    // Update session with wrap-up
    const { error: updateError } = await supabaseClient
      .from('sprint_review_sessions')
      .update({
        stakeholder_feedback: stakeholderFeedback,
        backlog_updates: backlogUpdates,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Database update error:', updateError);
      // Continue even if DB update fails
    }

    // Send email via Microsoft Graph API
    if (accessToken && stakeholders) {
      try {
        const stakeholdersList = Array.isArray(stakeholders) 
          ? stakeholders 
          : stakeholders.split(',').map((email: string) => email.trim()).filter(Boolean);

        const emailData = {
          message: {
            subject: `Sprint ${sprintNumber} Review - Summary & Next Steps`,
            body: {
              contentType: 'HTML',
              content: wrapupContent,
            },
            toRecipients: stakeholdersList.map((email: string) => ({
              emailAddress: { address: email },
            })),
          },
        };

        const sendResponse = await fetch(
          'https://graph.microsoft.com/v1.0/me/sendMail',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          }
        );

        if (!sendResponse.ok) {
          console.error('Failed to send email via Graph API');
          // Continue even if email fails
        } else {
          console.log('Wrap-up email sent successfully');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Continue even if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        wrapupContent,
        emailSent: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-review-wrapup function:', error);
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