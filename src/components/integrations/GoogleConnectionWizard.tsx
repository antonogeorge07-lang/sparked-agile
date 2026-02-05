import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Calendar, Mail, ArrowRight, Loader2, AlertCircle, RefreshCw, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleConnectionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 'intro' | 'connecting' | 'permissions' | 'success' | 'error';

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const GoogleConnectionWizard = ({ isOpen, onClose, onSuccess }: GoogleConnectionWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const steps = [
    { id: 'intro', label: 'Get Started', icon: GoogleIcon },
    { id: 'connecting', label: 'Connect', icon: Calendar },
    { id: 'permissions', label: 'Authorize', icon: User },
    { id: 'success', label: 'Complete', icon: CheckCircle2 },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  useEffect(() => {
    if (currentStep === 'intro') setProgress(0);
    else if (currentStep === 'connecting') setProgress(33);
    else if (currentStep === 'permissions') setProgress(66);
    else if (currentStep === 'success') setProgress(100);
  }, [currentStep]);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for Google connection success
      if (urlParams.get('google_connected') === 'true') {
        setCurrentStep('success');
        toast.success('Google account connected successfully!');
        window.history.replaceState({}, '', window.location.pathname);
        onSuccess?.();
      }
      
      // Check for Google connection error
      if (urlParams.get('google_error')) {
        setError(urlParams.get('google_error') || 'Connection failed');
        setCurrentStep('error');
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    if (isOpen) {
      handleCallback();
    }
  }, [isOpen, onSuccess]);

  const startConnection = async () => {
    setCurrentStep('connecting');
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in first');
      }

      const { data, error } = await supabase.functions.invoke('google-oauth-init', {
        body: { redirectUri: window.location.href }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No authorization URL returned');

      // Redirect to Google login
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to start connection');
      setCurrentStep('error');
    }
  };

  const handleClose = () => {
    setCurrentStep('intro');
    setError(null);
    setUserEmail(null);
    onClose();
  };

  const permissions = [
    { icon: Calendar, label: 'Access Google Calendar', description: 'View and manage your calendar events' },
    { icon: User, label: 'Read your profile', description: 'Get your email and display name' },
    { icon: Mail, label: 'Send notifications', description: 'Send ceremony reminders via Gmail (optional)' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GoogleIcon className="h-5 w-5" />
            Connect Google Workspace
          </DialogTitle>
          <DialogDescription>
            Sync your ceremonies and meetings with Google Calendar
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === stepIndex;
              const isComplete = index < stepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div className={`rounded-full p-1.5 ${
                    isComplete ? 'bg-primary text-primary-foreground' :
                    isActive ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[200px] flex flex-col">
          {currentStep === 'intro' && (
            <div className="space-y-4 flex-1">
              <div className="space-y-3">
                <h3 className="font-medium">What you'll get:</h3>
                {permissions.map((perm, i) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="p-3 flex items-start gap-3">
                      <perm.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{perm.label}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button onClick={startConnection} className="w-full gap-2">
                <GoogleIcon className="h-4 w-4" />
                Connect with Google
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {currentStep === 'connecting' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-medium">Connecting to Google...</p>
                <p className="text-sm text-muted-foreground">You'll be redirected to sign in</p>
              </div>
            </div>
          )}

          {currentStep === 'permissions' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-medium">Setting up your connection...</p>
                <p className="text-sm text-muted-foreground">Storing tokens securely</p>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">Successfully Connected!</p>
                {userEmail && (
                  <Badge variant="secondary" className="mt-2">{userEmail}</Badge>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Your Google Calendar is now synced
                </p>
              </div>
              <Button onClick={handleClose} className="mt-4">
                Done
              </Button>
            </div>
          )}

          {currentStep === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-medium text-lg">Connection Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={() => setCurrentStep('intro')} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
