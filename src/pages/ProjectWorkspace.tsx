import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

/**
 * Thin redirect-only page.
 *
 * /project-workspace is retained because it is the registered Microsoft
 * OAuth redirect URI. The full project-workspace UI has been consolidated
 * into the unified `integrations` system (see /integrations and /connect).
 *
 * Behaviour:
 * - If the URL carries an OAuth `code` (Microsoft callback), surface a brief
 *   "completing connection" state then forward to /integrations.
 * - Otherwise, redirect immediately to /integrations.
 */
export default function ProjectWorkspace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasOAuthCode = Boolean(searchParams.get("code"));

  useEffect(() => {
    const target = "/integrations";
    const delay = hasOAuthCode ? 600 : 0;
    const timer = window.setTimeout(() => navigate(target, { replace: true }), delay);
    return () => window.clearTimeout(timer);
  }, [hasOAuthCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Helmet>
        <title>Connecting - Spark-Agile</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">
          {hasOAuthCode ? "Completing connection..." : "Redirecting to integrations..."}
        </p>
      </div>
    </div>
  );
}
