import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Cookie, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    const consentGiven = localStorage.getItem("cookie_consent_given");
    
    if (!consentGiven) {
      setShowBanner(true);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_consents")
        .select("*")
        .eq("user_id", user.id)
        .order("consent_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!data) {
        setShowBanner(true);
      }
    }
  };

  const saveConsent = async (analytics: boolean, marketing: boolean) => {
    localStorage.setItem("cookie_consent_given", "true");
    localStorage.setItem("analytics_consent", analytics.toString());
    localStorage.setItem("marketing_consent", marketing.toString());

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("user_consents").insert({
        user_id: user.id,
        analytics_consent: analytics,
        marketing_consent: marketing,
        functional_consent: true,
        ip_address: null,
        user_agent: navigator.userAgent
      });

      if (error) {
        console.error("Error saving consent:", error);
      }
    }

    setShowBanner(false);
    toast({
      title: "Preferences saved",
      description: "Your cookie preferences have been saved.",
    });
  };

  const acceptAll = () => {
    saveConsent(true, true);
  };

  const acceptNecessary = () => {
    saveConsent(false, false);
  };

  const savePreferences = () => {
    saveConsent(analyticsConsent, marketingConsent);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg border-2">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Your Privacy Matters
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBanner(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!showDetails ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze site traffic, 
                  and personalize content. By clicking "Accept All", you consent to our use of cookies. 
                  You can customize your preferences or learn more in our{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button onClick={acceptAll} size="sm">
                    Accept All Cookies
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline" size="sm">
                    Necessary Only
                  </Button>
                  <Button
                    onClick={() => setShowDetails(true)}
                    variant="ghost"
                    size="sm"
                  >
                    Customize Settings
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize your cookie preferences. Essential cookies are required for the platform to function.
                </p>

                <div className="space-y-4 mb-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox checked disabled className="mt-1" />
                    <div>
                      <p className="font-medium text-sm">Essential Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Required for authentication, security, and core platform functionality.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      checked={analyticsConsent}
                      onCheckedChange={(checked) => setAnalyticsConsent(checked as boolean)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm">Analytics Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Help us understand how you use our platform to improve your experience.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Checkbox
                      checked={marketingConsent}
                      onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm">Marketing Cookies</p>
                      <p className="text-xs text-muted-foreground">
                        Used to deliver relevant content and offers based on your interests.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={savePreferences} size="sm">
                    Save Preferences
                  </Button>
                  <Button
                    onClick={() => setShowDetails(false)}
                    variant="outline"
                    size="sm"
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};