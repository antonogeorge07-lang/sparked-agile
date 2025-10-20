import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Github, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IntegrationWizardProps {
  type: "jira" | "github";
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export const IntegrationWizard = ({ type, onComplete, onCancel }: IntegrationWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    apiToken: "",
    repository: "",
    organization: "",
  });

  const totalSteps = type === "jira" ? 3 : 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    if (type === "jira") {
      if (step === 1) return formData.name.length > 0;
      if (step === 2) return formData.url.length > 0;
      if (step === 3) return formData.apiToken.length > 0;
    } else {
      if (step === 1) return formData.name.length > 0;
      if (step === 2) return formData.organization.length > 0;
      if (step === 3) return formData.repository.length > 0;
      if (step === 4) return formData.apiToken.length > 0;
    }
    return false;
  };

  const renderStep = () => {
    if (type === "jira") {
      switch (step) {
        case 1:
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Network className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Connect Jira</h3>
                  <p className="text-sm text-muted-foreground">Let's set up your Jira integration</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Jira Workspace"
                />
                <p className="text-xs text-muted-foreground">
                  Give this integration a memorable name
                </p>
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Jira Instance URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://your-domain.atlassian.net"
                />
                <p className="text-xs text-muted-foreground">
                  Your Jira cloud instance URL (without trailing slash)
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium mb-1">💡 Where to find this:</p>
                <p className="text-muted-foreground">
                  Look at your Jira URL when logged in - it should look like "yourcompany.atlassian.net"
                </p>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={formData.apiToken}
                  onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                  placeholder="Your Jira API token"
                />
                <p className="text-xs text-muted-foreground">
                  Your personal Jira API token for authentication
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
                <p className="font-medium">🔑 How to generate an API token:</p>
                <ol className="text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Go to Atlassian Account Settings</li>
                  <li>Select "Security" → "Create and manage API tokens"</li>
                  <li>Click "Create API token" and give it a label</li>
                  <li>Copy the token and paste it here</li>
                </ol>
              </div>
            </div>
          );
      }
    } else {
      switch (step) {
        case 1:
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Github className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Connect GitHub</h3>
                  <p className="text-sm text-muted-foreground">Let's set up your GitHub integration</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main GitHub Repository"
                />
                <p className="text-xs text-muted-foreground">
                  Give this integration a memorable name
                </p>
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="organization-name"
                />
                <p className="text-xs text-muted-foreground">
                  The GitHub organization or username that owns the repository
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium mb-1">💡 Example:</p>
                <p className="text-muted-foreground">
                  For github.com/acme-corp/my-repo, the organization is "acme-corp"
                </p>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repository">Repository Name</Label>
                <Input
                  id="repository"
                  value={formData.repository}
                  onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                  placeholder="repository-name"
                />
                <p className="text-xs text-muted-foreground">
                  The name of the repository you want to connect
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium mb-1">💡 Example:</p>
                <p className="text-muted-foreground">
                  For github.com/acme-corp/my-repo, the repository is "my-repo"
                </p>
              </div>
            </div>
          );
        case 4:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiToken">Personal Access Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={formData.apiToken}
                  onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                  placeholder="ghp_..."
                />
                <p className="text-xs text-muted-foreground">
                  GitHub personal access token with repo access
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
                <p className="font-medium">🔑 How to generate a token:</p>
                <ol className="text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Go to GitHub Settings → Developer settings</li>
                  <li>Select "Personal access tokens" → "Tokens (classic)"</li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Select "repo" scope and generate</li>
                  <li>Copy the token and paste it here</li>
                </ol>
              </div>
            </div>
          );
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Setup {type === "jira" ? "Jira" : "GitHub"} Integration</CardTitle>
          <Badge variant="outline">
            Step {step} of {totalSteps}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {step === totalSteps ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
