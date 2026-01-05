import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const SocialProofSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 px-4 bg-muted/30" aria-label="Trust indicators">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-2 px-6 py-4 bg-card rounded-lg border-2 border-primary/20">
            <p className="text-lg font-semibold text-foreground">
              {t('landing.socialProof.valueStatement')}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('landing.socialProof.valueDescription')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-2">
            ✓ {t('landing.socialProof.gdprReady')}
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ {t('landing.socialProof.dataEncrypted')}
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ {t('landing.socialProof.openFeedback')}
          </Badge>
          <Badge variant="outline" className="gap-2">
            ✓ {t('landing.socialProof.freeBeta')}
          </Badge>
        </div>
      </div>
    </section>
  );
};