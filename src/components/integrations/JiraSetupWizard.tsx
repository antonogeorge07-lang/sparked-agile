import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, ArrowRight, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JiraSetupWizardProps {
  projectId: string;
  onComplete?: () => void;
}

const steps = [
  { id: 1, title: "Create API Token", description: "Generate an Atlassian API token" },
  { id: 2, title: "Enter Credentials", description: "Provide your JIRA connection details" },
  { id: 3, title: "Verify Connection", description: "Test and activate your integration" },
];

export function JiraSetupWizard({ projectId, onComplete }: JiraSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [jiraBoardId, setJiraBoardId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleVerify = async () => {
    if (!jiraEmail || !jiraSiteUrl || !jiraApiToken) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsVerifying(true);
    try {
      // Store the JIRA connection via the connect-jira edge function
      const { data, error } = await supabase.functions.invoke("connect-jira", {
        body: {
          projectId,
          jiraEmail,
          jiraSiteUrl: jiraSiteUrl.replace(/\/$/, ""), // Remove trailing slash
          jiraApiToken,
          jiraBoardId: jiraBoardId || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setIsConnected(true);
        toast.success("JIRA connected successfully!");
        onComplete?.();
      } else {
        throw new Error(data?.error || "Connection failed");
      }
    } catch (err: any) {
      toast.error(`Connection failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold">JIRA Connected Successfully</p>
            <p className="text-sm text-muted-foreground">
              Your backlog data will sync automatically. Refresh the page to see live data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Connect JIRA</CardTitle>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Encrypted
          </Badge>
        </div>
        <CardDescription>
          Follow these steps to connect your Atlassian JIRA board for real-time backlog sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
              </div>
              <span className="text-sm hidden sm:inline">{step.title}</span>
              {idx < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: Instructions */}
        {currentStep === 1 && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <h3 className="font-medium">Generate an Atlassian API Token</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to your Atlassian account security settings</li>
              <li>Click <strong>"Create API token"</strong></li>
              <li>Give it a descriptive label (e.g., "Spark-Agile")</li>
              <li>Copy the generated token - you'll need it in the next step</li>
            </ol>
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Atlassian Token Page
              </Button>
            </a>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)}>
                I have my token <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jira-email">JIRA Email</Label>
              <Input
                id="jira-email"
                type="email"
                placeholder="you@company.com"
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-site">JIRA Site URL</Label>
              <Input
                id="jira-site"
                type="url"
                placeholder="https://yourcompany.atlassian.net"
                value={jiraSiteUrl}
                onChange={(e) => setJiraSiteUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Your Atlassian cloud domain</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-token">API Token</Label>
              <Input
                id="jira-token"
                type="password"
                placeholder="Paste your API token"
                value={jiraApiToken}
                onChange={(e) => setJiraApiToken(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jira-board">Board ID (optional)</Label>
              <Input
                id="jira-board"
                placeholder="e.g., 123"
                value={jiraBoardId}
                onChange={(e) => setJiraBoardId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find this in your JIRA board URL: /board/123
              </p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!jiraEmail || !jiraSiteUrl || !jiraApiToken}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verify */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h3 className="font-medium">Review Connection Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span>{jiraEmail}</span>
                <span className="text-muted-foreground">Site:</span>
                <span>{jiraSiteUrl}</span>
                <span className="text-muted-foreground">Board:</span>
                <span>{jiraBoardId || "Auto-detect"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your credentials are encrypted with AES-256-GCM before storage.
              </p>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Connect JIRA"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
