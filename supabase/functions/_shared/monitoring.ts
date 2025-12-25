/**
 * Production monitoring utilities for Supabase Edge Functions
 */

export interface RequestContext {
  requestId: string;
  startTime: number;
  userId?: string;
  functionName: string;
  method: string;
  path: string;
}

export interface LogEntry {
  timestamp: string;
  requestId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  duration?: number;
}

/**
 * Create a unique request context for tracking
 */
export function createRequestContext(
  req: Request,
  functionName: string
): RequestContext {
  const url = new URL(req.url);
  return {
    requestId: crypto.randomUUID().slice(0, 8),
    startTime: Date.now(),
    functionName,
    method: req.method,
    path: url.pathname
  };
}

/**
 * Structured logging with request context
 */
export class Logger {
  private context: RequestContext;
  
  constructor(context: RequestContext) {
    this.context = context;
  }
  
  private formatLog(level: string, message: string, extra?: Record<string, unknown>): void {
    const duration = Date.now() - this.context.startTime;
    const entry = {
      ts: new Date().toISOString(),
      req: this.context.requestId,
      fn: this.context.functionName,
      lvl: level,
      dur: `${duration}ms`,
      msg: message,
      ...extra
    };
    
    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }
  
  debug(message: string, extra?: Record<string, unknown>): void {
    this.formatLog('debug', message, extra);
  }
  
  info(message: string, extra?: Record<string, unknown>): void {
    this.formatLog('info', message, extra);
  }
  
  warn(message: string, extra?: Record<string, unknown>): void {
    this.formatLog('warn', message, extra);
  }
  
  error(message: string, error?: Error | unknown, extra?: Record<string, unknown>): void {
    const errorInfo = error instanceof Error 
      ? { errorName: error.name, errorMessage: error.message }
      : { error: String(error) };
    this.formatLog('error', message, { ...errorInfo, ...extra });
  }
  
  /**
   * Log request completion with timing
   */
  complete(statusCode: number, extra?: Record<string, unknown>): void {
    const duration = Date.now() - this.context.startTime;
    this.formatLog('info', 'Request completed', { 
      status: statusCode, 
      totalDuration: `${duration}ms`,
      ...extra 
    });
  }
  
  /**
   * Set user context after authentication
   */
  setUser(userId: string): void {
    this.context.userId = userId;
  }
}

/**
 * Health check response generator
 */
export function createHealthCheckResponse(
  functionName: string,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      function: functionName,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Error response with proper structure
 */
export function createErrorResponse(
  message: string,
  statusCode: number,
  corsHeaders: Record<string, string>,
  requestId?: string,
  details?: Record<string, unknown>
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      statusCode,
      requestId,
      timestamp: new Date().toISOString(),
      ...details
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Input validation helper
 */
export function validateInput<T extends Record<string, unknown>>(
  data: unknown,
  requiredFields: (keyof T)[],
  validators?: Partial<Record<keyof T, (value: unknown) => boolean>>
): { valid: true; data: T } | { valid: false; error: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: 'Invalid request body' };
  }
  
  const obj = data as Record<string, unknown>;
  
  for (const field of requiredFields) {
    if (!(field in obj) || obj[field as string] === undefined || obj[field as string] === null) {
      return { valid: false, error: `Missing required field: ${String(field)}` };
    }
    
    // Run custom validator if provided
    const validator = validators?.[field];
    if (validator && !validator(obj[field as string])) {
      return { valid: false, error: `Invalid value for field: ${String(field)}` };
    }
  }
  
  return { valid: true, data: obj as T };
}

/**
 * Safe JSON parse
 */
export async function parseJsonBody<T = unknown>(req: Request): Promise<{ data: T } | { error: string }> {
  try {
    const text = await req.text();
    if (!text.trim()) {
      return { data: {} as T };
    }
    const data = JSON.parse(text) as T;
    return { data };
  } catch {
    return { error: 'Invalid JSON in request body' };
  }
}
