import { Badge } from "@/components/ui/badge";

export const SocialProofSection = () => {
  return (
    <section className="py-12 px-4 bg-muted/30" aria-label="Trust indicators">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Value Statement - No fake metrics */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-2 px-6 py-4 bg-card rounded-lg border-2 border-primary/20">
            <p className="text-lg font-semibold text-foreground">
              Streamline Your Agile Ceremonies
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-assisted sprint planning, daily digests, and ceremony automation—so you can focus on building great products.
            </p>
          </div>
        </div>

        {/* Trust Indicators - Only truthful claims */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-2">
            ✓ GDPR Ready
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ Data Encrypted
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ Open Feedback
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ Free During Beta
          </Badge>
        </div>
      </div>
    </section>
  );
};
