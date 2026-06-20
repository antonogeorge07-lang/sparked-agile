/**
 * Production-ready rate limiter for Supabase Edge Functions
 * Uses in-memory storage (per-instance) with configurable limits
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  waitSeconds: number;
}

// Default configurations for different use cases
export const RATE_LIMIT_CONFIGS = {
  // Standard API endpoints
  default: { windowMs: 60000, maxRequests: 60 },
  // AI-powered features (more expensive)
  ai: { windowMs: 60000, maxRequests: 10 },
  // Authentication endpoints (prevent brute force)
  auth: { windowMs: 300000, maxRequests: 5 },
  // Webhook endpoints
  webhook: { windowMs: 60000, maxRequests: 100 },
  // Public endpoints (stricter)
  public: { windowMs: 60000, maxRequests: 30 },
} as const;

// In-memory storage (per function instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 300000; // 5 minutes

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check rate limit for a given identifier (usually user ID or IP)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): RateLimitResult {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}:${config.maxRequests}`;
  const entry = rateLimitStore.get(key);
  
  // New window or expired
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
      waitSeconds: 0
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const waitSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      waitSeconds
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
    waitSeconds: 0
  };
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    ...(result.waitSeconds > 0 && { 'Retry-After': String(result.waitSeconds) })
  };
}

/**
 * Create a rate limited error response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  config: RateLimitConfig,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: `Rate limit exceeded. Try again in ${result.waitSeconds} seconds`,
      retryAfter: result.waitSeconds
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result, config)
      }
    }
  );
}

/**
 * Middleware-style rate limit check
 * Returns null if allowed, or a Response if rate limited
 */
export function withRateLimit(
  identifier: string,
  config: RateLimitConfig,
  corsHeaders: Record<string, string>
): Response | null {
  const result = checkRateLimit(identifier, config);
  
  if (!result.allowed) {
    return createRateLimitResponse(result, config, corsHeaders);
  }
  
  return null;
}
