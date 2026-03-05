import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Github, Network, Circle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface IntegrationWizardProps {
  type: "jira" | "github";
  onComplete: (data: any) => void;
  onCancel: () => void;
}

interface StepInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const IntegrationWizard = ({ type, onComplete, onCancel }: IntegrationWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    email: "",
    apiToken: "",
    repository: "",
    organization: "",
  });

  const getSteps = (): StepInfo[] => {
    if (type === "jira") {
      return [
        { title: "Name", description: "Integration name", icon: <Sparkles className="h-4 w-4" /> },
        { title: "URL", description: "Jira instance", icon: <Network className="h-4 w-4" /> },
        { title: "Auth", description: "Credentials", icon: <CheckCircle className="h-4 w-4" /> },
      ];
    }
    return [
      { title: "Name", description: "Integration name", icon: <Sparkles className="h-4 w-4" /> },
      { title: "Org", description: "Organization", icon: <Github className="h-4 w-4" /> },
      { title: "Repo", description: "Repository", icon: <Network className="h-4 w-4" /> },
      { title: "Auth", description: "Token", icon: <CheckCircle className="h-4 w-4" /> },
    ];
  };

  const steps = getSteps();
  const totalSteps = steps.length;
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
      if (step === 3) return formData.email.length > 0 && formData.apiToken.length > 0;
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
            <motion.div
              key="jira-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Network className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connect Jira</h3>
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
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Give this integration a memorable name
                </p>
              </div>
            </motion.div>
          );
        case 2:
          return (
            <motion.div
              key="jira-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="url">Jira Instance URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="your-domain.atlassian.net"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Your Jira cloud instance URL (without trailing slash)
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Where to find this
                </p>
                <p className="text-muted-foreground">
                  Look at your Jira URL when logged in - it should look like "yourcompany.atlassian.net"
                </p>
              </div>
            </motion.div>
          );
        case 3:
          return (
            <motion.div
              key="jira-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Jira Account Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@company.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={formData.apiToken}
                  onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                  placeholder="Your Jira API token"
                  className="h-11"
                />
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How to generate an API token
                </p>
                <ol className="text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Go to Atlassian Account Settings</li>
                  <li>Select "Security" → "Create and manage API tokens"</li>
                  <li>Click "Create API token" and give it a label</li>
                  <li>Copy the token and paste it here</li>
                </ol>
              </div>
            </motion.div>
          );
      }
    } else {
      switch (step) {
        case 1:
          return (
            <motion.div
              key="github-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Github className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connect GitHub</h3>
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
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Give this integration a memorable name
                </p>
              </div>
            </motion.div>
          );
        case 2:
          return (
            <motion.div
              key="github-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="organization-name"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  The GitHub organization or username that owns the repository
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Example
                </p>
                <p className="text-muted-foreground">
                  For github.com/acme-corp/my-repo, the organization is "acme-corp"
                </p>
              </div>
            </motion.div>
          );
        case 3:
          return (
            <motion.div
              key="github-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="repository">Repository Name</Label>
                <Input
                  id="repository"
                  value={formData.repository}
                  onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                  placeholder="repository-name"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  The name of the repository you want to connect
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Example
                </p>
                <p className="text-muted-foreground">
                  For github.com/acme-corp/my-repo, the repository is "my-repo"
                </p>
              </div>
            </motion.div>
          );
        case 4:
          return (
            <motion.div
              key="github-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="apiToken">Personal Access Token</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={formData.apiToken}
                  onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                  placeholder="ghp_..."
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  GitHub personal access token with repo access
                </p>
              </div>
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How to generate a token
                </p>
                <ol className="text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Go to GitHub Settings → Developer settings</li>
                  <li>Select "Personal access tokens" → "Tokens (classic)"</li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Select "repo" scope and generate</li>
                  <li>Copy the token and paste it here</li>
                </ol>
              </div>
            </motion.div>
          );
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl">Setup {type === "jira" ? "Jira" : "GitHub"} Integration</CardTitle>
            <CardDescription>Follow the steps below to connect your service</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            {step}/{totalSteps}
          </Badge>
        </div>
        
        {/* Visual Step Indicator */}
        <div className="flex items-center justify-between px-2">
          {steps.map((stepInfo, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === step;
            const isCompleted = stepNumber < step;
            
            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground",
                      isActive && "bg-primary/20 border-2 border-primary text-primary",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      stepInfo.icon
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      isActive && "text-primary",
                      isCompleted && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {stepInfo.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">
                      {stepInfo.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 mx-2 mt-[-20px] transition-colors duration-300",
                    stepNumber < step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-1 mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? onCancel : handleBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="gap-2"
          >
            {step === totalSteps ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};