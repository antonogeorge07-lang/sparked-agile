import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionTesterProps {
  type: "jira" | "github";
  config?: any;
  onTestComplete?: (success: boolean, message?: string) => void;
}

export const ConnectionTester = ({ type, onTestComplete }: ConnectionTesterProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in to test the connection");

      const { data, error } = await supabase.functions.invoke("validate-integration-token", {
        body: { integrationType: type },
      });

      if (error) throw new Error(error.message || "Unable to reach validation service");
      if (!data?.isValid) {
        throw new Error(data?.error || "Connection failed. Please reconnect.");
      }

      const successMessage = type === "jira"
        ? "Successfully connected to Jira"
        : "Successfully connected to GitHub";

      setTestResult({ success: true, message: successMessage });
      onTestComplete?.(true, successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      setTestResult({ success: false, message: errorMessage });
      onTestComplete?.(false, errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={testConnection}
        disabled={isTesting}
        className="gap-2"
      >
        {isTesting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Testing Connection...
          </>
        ) : (
          <>
            <TestTube className="h-4 w-4" />
            Test Connection
          </>
        )}
      </Button>

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          {testResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription className="ml-2">
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
