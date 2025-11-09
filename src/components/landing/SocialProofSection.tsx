import { Badge } from "@/components/ui/badge";

export const SocialProofSection = () => {
  return (
    <section className="py-12 px-4 bg-muted/30" aria-label="Trust indicators">
      <div className="container mx-auto max-w-6xl">
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