import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface EmailCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "early_access" | "newsletter" | "beta" | "exit_intent";
}

const emailSchema = z.string().email("Please enter a valid email address");

export const EmailCaptureForm = ({ isOpen, onClose, context = "newsletter" }: EmailCaptureFormProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const contextConfig = {
    early_access: {
      title: "Get Early Access",
      description: "Be the first to try new features and get exclusive updates",
      benefit: "🎁 Get 3 months free Pro plan when we launch"
    },
    newsletter: {
      title: "Stay Updated",
      description: "Join 1,000+ agile teams getting productivity tips and updates",
      benefit: "📧 Weekly agile best practices and platform updates"
    },
    beta: {
      title: "Join Beta Program",
      description: "Help shape the future of SM ActiveIntelligence",
      benefit: "🚀 Free lifetime Pro access for beta testers"
    },
    exit_intent: {
      title: "Welcome! Let's Get Started",
      description: "Get a personalized demo and see how we can transform your workflow",
      benefit: "🎯 Free personalized onboarding and dedicated support"
    }
  };

  const config = contextConfig[context];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email);
    } catch {
      setError("Please enter a valid email address");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Integrate with your email service (Resend, Mailchimp, etc.)
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("🎉 Thank you! Check your email for next steps.");
      
      // Track conversion
      if (window.gtag) {
        window.gtag('event', 'email_capture', {
          context: context,
          email_domain: email.split('@')[1]
        });
      }
      
      setEmail("");
      setName("");
      onClose();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="h-6 w-6 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-primary/10 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
          <Gift className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{config.benefit}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
              Maybe Later
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Get Access
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
};
