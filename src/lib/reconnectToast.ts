import { toast } from "sonner";

const lastShown: Record<string, number> = {};
const DEBOUNCE_MS = 30_000;

type Provider = "jira" | "github" | "slack" | "google" | string;

interface ReconnectPayload {
  reconnect_required?: boolean;
  error?: string;
  provider?: Provider;
  [key: string]: any;
}

const PROVIDER_LABELS: Record<string, string> = {
  jira: "Jira",
  github: "GitHub",
  slack: "Slack",
  google: "Google",
};

/**
 * Show a single global toast prompting the user to reconnect an integration.
 * Debounced per-provider so repeated hot-path failures do not spam the UI.
 * Returns true if the payload signalled a reconnect requirement.
 */
export function maybeShowReconnectToast(
  payload: ReconnectPayload | null | undefined,
  fallbackProvider?: Provider,
): boolean {
  if (!payload?.reconnect_required) return false;

  const provider = (payload.provider || fallbackProvider || "integration") as string;
  const now = Date.now();
  if (lastShown[provider] && now - lastShown[provider] < DEBOUNCE_MS) {
    return true;
  }
  lastShown[provider] = now;

  const label = PROVIDER_LABELS[provider] || provider;
  const reason =
    payload.error === "TOKEN_MISSING"
      ? `${label} token is missing.`
      : payload.error === "TOKEN_INVALID"
      ? `${label} token expired or was revoked.`
      : payload.error === "NOT_CONFIGURED"
      ? `${label} is not configured for this project.`
      : `${label} needs to be reconnected.`;

  toast.error(`Reconnect ${label}`, {
    description: reason,
    duration: 10_000,
    action: {
      label: "Reconnect",
      onClick: () => {
        window.location.assign(`/integrations?reconnect=${provider}`);
      },
    },
  });

  return true;
}
