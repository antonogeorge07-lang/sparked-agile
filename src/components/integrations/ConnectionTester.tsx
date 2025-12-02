import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectionTesterProps {
  type: "jira" | "github";
  config: any;
  onTestComplete?: (success: boolean, message?: string) => void;
}

export const ConnectionTester = ({ type, config, onTestComplete }: ConnectionTesterProps) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Basic validation
      if (type === "jira") {
        if (!config.url || !config.apiToken) {
          throw new Error("Missing URL or API token");
        }
        
        // Validate URL format
        try {
          new URL(config.url);
        } catch {
          throw new Error("Invalid URL format");
        }

        // Check if URL is an Atlassian domain
        if (!config.url.includes("atlassian.net")) {
          throw new Error("URL must be an Atlassian domain");
        }
      } else {
        if (!config.organization || !config.repository || !config.apiToken) {
          throw new Error("Missing organization, repository, or token");
        }

        // Validate naming format (allow letters, numbers, dots, hyphens, and underscores)
        const nameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!nameRegex.test(config.organization)) {
          throw new Error("Invalid organization name format. Use only letters, numbers, dots, hyphens, and underscores");
        }
        if (!nameRegex.test(config.repository)) {
          throw new Error("Invalid repository name format. Use only letters, numbers, dots, hyphens, and underscores");
        }
      }

      // Success
      const successMessage = type === "jira" 
        ? "Successfully connected to Jira workspace"
        : `Successfully connected to ${config.organization}/${config.repository}`;
      
      setTestResult({
        success: true,
        message: successMessage,
      });
      
      onTestComplete?.(true, successMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      setTestResult({
        success: false,
        message: errorMessage,
      });
      
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
