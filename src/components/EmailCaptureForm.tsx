import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface EmailCaptureFormProps {
  isOpen: boolean;
  onClose: () => void;
  context?: "early_access" | "newsletter" | "beta" | "exit_intent";
}

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);

export const EmailCaptureForm = ({ isOpen, onClose, context = "newsletter" }: EmailCaptureFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const config = {
    early_access: {
      title: t('emailCapture.earlyAccess.title'),
      description: t('emailCapture.earlyAccess.description'),
      benefit: "🎁 " + t('emailCapture.earlyAccess.benefit')
    },
    newsletter: {
      title: t('emailCapture.newsletter.title'),
      description: t('emailCapture.newsletter.description'),
      benefit: "📧 " + t('emailCapture.newsletter.benefit')
    },
    beta: {
      title: t('emailCapture.beta.title'),
      description: t('emailCapture.beta.description'),
      benefit: "🚀 " + t('emailCapture.beta.benefit')
    },
    exit_intent: {
      title: t('emailCapture.exitIntent.title'),
      description: t('emailCapture.exitIntent.description'),
      benefit: "🎯 " + t('emailCapture.exitIntent.benefit')
    }
  }[context];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    try {
      emailSchema.parse(email);
    } catch {
      setError("Please enter a valid email address");
      return;
    }

    // Validate name
    try {
      nameSchema.parse(name);
    } catch {
      setError("Please enter your name (at least 2 characters)");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("capture-email", {
        body: { 
          email: email.trim().toLowerCase(), 
          name: name.trim(), 
          context 
        }
      });

      if (fnError) {
        console.error("Email capture error:", fnError);
        throw new Error(fnError.message || "Failed to submit");
      }

      if (data?.error) {
        throw new Error(data.error);
      }
      
      toast.success("🎉 Thank you! Check your email for next steps.");
      
      // Track conversion
      if ((window as any).gtag) {
        (window as any).gtag('event', 'email_capture', {
          context: context,
          email_domain: email.split('@')[1]
        });
      }
      
      setEmail("");
      setName("");
      onClose();
    } catch (err: any) {
      console.error("Email capture failed:", err);
      if (err.message?.includes("Too many requests")) {
        toast.error("Too many requests. Please try again in a minute.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="h-6 w-6 text-tier-free" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-tier-free/10 border border-tier-free/20 p-4 rounded-lg flex items-start gap-3">
          <Gift className="h-5 w-5 text-tier-free mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{config.benefit}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('emailCapture.name')}</Label>
            <Input
              id="name"
              placeholder={t('emailCapture.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('emailCapture.workEmail')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailCapture.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
              {t('emailCapture.maybeLater')}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gap-2 bg-tier-free hover:bg-tier-free/90">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('emailCapture.submitting')}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  {t('emailCapture.getAccess')}
                </>
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          {t('emailCapture.privacyNotice')}
        </p>
      </DialogContent>
    </Dialog>
  );
};
