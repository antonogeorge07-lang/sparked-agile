import { Badge } from "@/components/ui/badge";

export const SocialProofSection = () => {
  return (
    <section className="py-12 px-4 bg-muted/30" aria-label="Trust indicators and time savings">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Before/After Time Savings */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-card rounded-lg border-2 border-primary/20">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Sprint Planning Before</p>
              <p className="text-2xl font-bold text-destructive">10 hours</p>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">→</div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">With SAAI</p>
              <p className="text-2xl font-bold text-primary">2 hours</p>
            </div>
            <div className="text-left pl-4 border-l border-border">
              <p className="text-sm text-muted-foreground">Time Saved</p>
              <p className="text-2xl font-bold text-green-600">80%</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-2">
            ✓ GDPR Compliant
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ Enterprise Security
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ 99.9% Uptime
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ 24/7 Support
          </Badge>
        </div>
      </div>
    </section>
  );
};