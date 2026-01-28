/**
 * Secure CORS headers with origin validation
 * Replaces wildcard CORS to prevent CSRF-like attacks
 */

/**
 * Get CORS headers with origin validation
 * Only allows requests from known Lovable/Supabase origins
 */
export function getSecureCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  
  // Extract the project ID from Supabase URL
  const projectMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectId = projectMatch ? projectMatch[1] : '';
  
  // Define allowed origins
  const allowedOrigins = [
    `https://${projectId}.supabase.co`,
    'https://lovable.dev',
    'https://sparked-agile.lovable.app',
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Local development alternative
  ];
  
  // Also allow any Lovable preview URLs
  const isLovablePreview = origin.includes('.lovable.app') || origin.includes('.lovableproject.com');
  const isAllowed = allowedOrigins.includes(origin) || isLovablePreview || origin === '';
  
  // For same-origin requests or allowed origins, echo back the origin
  // For disallowed origins, return the primary allowed origin (will fail CORS check)
  const allowedOrigin = isAllowed && origin ? origin : (allowedOrigins[0] || '*');
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-caller-function, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle CORS preflight request
 */
export function handleSecureCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getSecureCorsHeaders(req) });
  }
  return null;
}

/**
 * Create a JSON response with secure CORS headers
 */
export function secureJsonResponse(
  req: Request,
  data: unknown,
  status: number = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...getSecureCorsHeaders(req),
        'Content-Type': 'application/json',
        ...extraHeaders
      }
    }
  );
}

/**
 * Create an error response with secure CORS headers
 */
export function secureErrorResponse(
  req: Request,
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): Response {
  return secureJsonResponse(
    req,
    { error: message, ...details },
    status
  );
}

// Legacy compatibility - wildcard CORS for truly public endpoints (e.g., webhooks)
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
