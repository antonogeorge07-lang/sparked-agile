// Shared HMAC-signed OAuth state helpers.
// Prevents an attacker from forging a state payload with another user's id.

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function getSigningSecret(): string {
  const secret =
    Deno.env.get("OAUTH_STATE_SECRET") ||
    Deno.env.get("TOKEN_ENCRYPTION_KEY");
  if (!secret) {
    throw new Error("OAUTH_STATE_SECRET (or TOKEN_ENCRYPTION_KEY) not configured");
  }
  return secret;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Sign an arbitrary payload object into a URL-safe state string.
 * Output: base64url(payload).base64url(hmac)
 */
export async function signOAuthState(
  payload: Record<string, unknown>,
): Promise<string> {
  const body = { ...payload, iat: Date.now(), nonce: crypto.randomUUID() };
  const payloadJson = JSON.stringify(body);
  const payloadB64 = toBase64Url(encoder.encode(payloadJson));
  const key = await hmacKey(getSigningSecret());
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64)),
  );
  return `${payloadB64}.${toBase64Url(sig)}`;
}

/**
 * Verify a signed state and return its payload, or throw.
 * Rejects states older than maxAgeMs (default 15 minutes).
 */
export async function verifyOAuthState<T = Record<string, unknown>>(
  state: string | null | undefined,
  maxAgeMs = 15 * 60 * 1000,
): Promise<T> {
  if (!state || typeof state !== "string" || !state.includes(".")) {
    throw new Error("Invalid OAuth state");
  }
  const [payloadB64, sigB64] = state.split(".");
  if (!payloadB64 || !sigB64) throw new Error("Invalid OAuth state");
  const key = await hmacKey(getSigningSecret());
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64)),
  );
  const providedSig = fromBase64Url(sigB64);
  if (!timingSafeEqual(expectedSig, providedSig)) {
    throw new Error("OAuth state signature mismatch");
  }
  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
  if (typeof payload?.iat === "number" && Date.now() - payload.iat > maxAgeMs) {
    throw new Error("OAuth state expired");
  }
  return payload as T;
}

/**
 * Validate a post-OAuth redirect target. Only allows relative paths under
 * the application (must start with '/' and not '//' or '/\\'). Falls back
 * to the supplied default. Prevents open-redirect and XSS via quote breaks.
 */
export function safeRedirectPath(input: unknown, fallback = "/integrations"): string {
  if (typeof input !== "string" || input.length === 0) return fallback;
  // Strip control characters
  const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, "");
  if (!cleaned.startsWith("/")) return fallback;
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return fallback;
  // Reject any quote/script-breaking chars
  if (/['"<>`\\]/.test(cleaned)) return fallback;
  // Cap length
  if (cleaned.length > 512) return fallback;
  return cleaned;
}

export function safeOAuthOrigin(input: unknown, fallback = "https://spark-agile.com"): string {
  if (typeof input !== "string" || input.length === 0) return fallback;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return fallback;
    if (url.pathname !== "/" || url.search || url.hash) return fallback;
    return url.origin;
  } catch (_) {
    return fallback;
  }
}

export function oauthCallbackUrl(origin: string, provider: string): string {
  return `${safeOAuthOrigin(origin)}/oauth/${provider}/callback`;
}
