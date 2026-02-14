import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt AES-GCM encrypted token
async function decryptToken(encryptedBase64: string, key: string): Promise<string> {
  const { decodeBase64 } = await import("https://deno.land/std@0.224.0/encoding/base64.ts");
  const combined = decodeBase64(encryptedBase64);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, cryptoKey, data
  );

  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { summary, description, startDateTime, endDateTime, attendees, timeZone } = await req.json();

    if (!summary || !startDateTime || !endDateTime) {
      throw new Error('Missing required fields: summary, startDateTime, endDateTime');
    }

    // Get user's Google tokens
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: tokenData, error: tokenError } = await adminClient
      .from('user_google_tokens')
      .select('access_token_encrypted, refresh_token_encrypted, expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenError || !tokenData) {
      throw new Error('Google account not connected. Please connect your Google account first.');
    }

    let accessToken = await decryptToken(tokenData.access_token_encrypted, serviceKey);

    // Check if token is expired and refresh if needed
    if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
      if (!tokenData.refresh_token_encrypted) {
        throw new Error('Google token expired and no refresh token available. Please reconnect.');
      }

      const refreshToken = await decryptToken(tokenData.refresh_token_encrypted, serviceKey);
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Google token. Please reconnect.');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Store refreshed token
      const { encodeBase64 } = await import("https://deno.land/std@0.224.0/encoding/base64.ts");
      const encoder = new TextEncoder();
      const tokenBytes = encoder.encode(accessToken);
      const keyBytes = encoder.encode(serviceKey.padEnd(32, '0').slice(0, 32));
      const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, tokenBytes);
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      await adminClient
        .from('user_google_tokens')
        .update({
          access_token_encrypted: encodeBase64(combined),
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Create Google Calendar event
    const event: Record<string, unknown> = {
      summary,
      description: description || '',
      start: {
        dateTime: startDateTime,
        timeZone: timeZone || 'UTC',
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone || 'UTC',
      },
    };

    if (attendees && attendees.length > 0) {
      event.attendees = attendees.map((email: string) => ({ email }));
    }

    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!calendarResponse.ok) {
      const errText = await calendarResponse.text();
      console.error('Google Calendar API error:', errText);
      throw new Error('Failed to create Google Calendar event');
    }

    const createdEvent = await calendarResponse.json();
    console.log('Google Calendar event created:', createdEvent.id, 'for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        eventId: createdEvent.id,
        htmlLink: createdEvent.htmlLink,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Create Google Calendar event error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
