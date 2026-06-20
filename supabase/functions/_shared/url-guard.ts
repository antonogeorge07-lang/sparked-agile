/**
 * Shared SSRF guard. Validates a user-supplied URL is safe to fetch from
 * an edge function (https only, public hostnames only).
 */
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fd00:/i,
  /^fe80:/i,
];

// 172.16.0.0 - 172.31.255.255
function isPrivate172(host: string): boolean {
  const m = host.match(/^172\.(\d{1,3})\./);
  if (!m) return false;
  const n = parseInt(m[1], 10);
  return n >= 16 && n <= 31;
}

export interface UrlGuardResult {
  ok: boolean;
  url?: URL;
  error?: string;
}

export function validateExternalUrl(input: string): UrlGuardResult {
  if (!input || typeof input !== "string") {
    return { ok: false, error: "URL is required" };
  }
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, error: "Invalid URL" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Only https URLs are allowed" };
  }
  const host = parsed.hostname.toLowerCase();
  if (!host || host === "metadata.google.internal") {
    return { ok: false, error: "Disallowed host" };
  }
  for (const re of PRIVATE_HOST_PATTERNS) {
    if (re.test(host)) return { ok: false, error: "Private or loopback hosts are not allowed" };
  }
  if (isPrivate172(host)) {
    return { ok: false, error: "Private hosts are not allowed" };
  }
  return { ok: true, url: parsed };
}
