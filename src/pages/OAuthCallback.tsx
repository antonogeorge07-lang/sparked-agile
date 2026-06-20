import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOAuthCallbackUrl } from "@/lib/oauth";

const providerFunctionMap = {
    github: "github-oauth-callback",
    jira: "jira-oauth-callback",
    google: "google-oauth-callback",
} as const;

const supportedProviders = ["github", "jira", "google", "slack", "microsoft"] as const;

type OAuthProvider = (typeof supportedProviders)[number];

const isProvider = (value: string | undefined): value is OAuthProvider =>
    !!value && supportedProviders.includes(value as OAuthProvider);

export default function OAuthCallback() {
    const { provider } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Completing secure connection...");

    useEffect(() => {
        const completeOAuth = async () => {
            if (!isProvider(provider)) {
                navigate("/integrations?oauth=error&message=Unsupported%20provider", { replace: true });
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const providerError = params.get("error");
            if (providerError) {
                navigate(`/integrations?${provider}=error&message=${encodeURIComponent(providerError)}`, { replace: true });
                return;
            }

            try {
                if (provider === "slack") {
                    setMessage("Connecting Slack workspace...");
                    const state = params.get("state");
                    const storedState = sessionStorage.getItem("slack_oauth_state");
                    const code = params.get("code");

                    if (!code || !state || state !== storedState) {
                        throw new Error("Slack verification failed. Please try connecting again.");
                    }

                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error("Please log in before connecting Slack.");

                    const { data, error } = await supabase.functions.invoke("slack-oauth-callback", {
                        body: {
                            code,
                            redirectUri: getOAuthCallbackUrl("slack"),
                            userId: user.id,
                        },
                    });

                    if (error) throw error;
                    if (!data?.success) throw new Error(data?.error || "Slack connection failed");

                    sessionStorage.removeItem("slack_oauth_state");
                    navigate(`/integrations?slack=success`, { replace: true });
                    return;
                }

                if (provider === "microsoft") {
                    setMessage("Connecting Microsoft workspace...");
                    const code = params.get("code");
                    if (!code) throw new Error("Microsoft did not return an authorisation code.");

                    const { data, error } = await supabase.functions.invoke("get-microsoft-token", {
                        body: {
                            code,
                            redirectUri: getOAuthCallbackUrl("microsoft"),
                        },
                    });

                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);

                    const targetPath = sessionStorage.getItem("microsoft_redirect_path") || "/integrations";
                    sessionStorage.removeItem("microsoft_redirect_path");
                    navigate(`${targetPath}${targetPath.includes("?") ? "&" : "?"}microsoft=success`, { replace: true });
                    return;
                }

                setMessage(`Connecting ${provider}...`);
                params.set("response", "json");
                const functionName = providerFunctionMap[provider];
                const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}?${params.toString()}`;

                const response = await fetch(functionUrl, {
                    headers: {
                        Accept: "application/json",
                        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                    },
                });

                const result = await response.json().catch(() => ({}));
                if (!response.ok || result.error) {
                    throw new Error(result.error || `${provider} connection failed`);
                }

                navigate(result.redirectUrl || `/integrations?${provider}=success`, { replace: true });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "OAuth connection failed";
                navigate(`/integrations?${provider}=error&message=${encodeURIComponent(errorMessage)}`, { replace: true });
            }
        };

        completeOAuth();
    }, [navigate, provider]);

    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h1 className="text-xl font-semibold">Secure connection</h1>
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </main>
    );
}