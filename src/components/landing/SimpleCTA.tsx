import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Lock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function SimpleCTA() {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div
        className="container mx-auto max-w-2xl text-center relative z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`transition-transform duration-500 ${isHovered ? "scale-[1.01]" : ""}`}
        >
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />

          <h2
            id="cta-heading"
            className="text-3xl md:text-4xl font-bold font-heading mb-4"
          >
            {t("landing.cta.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            {t("landing.cta.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth">
              <Button
                size="lg"
                className="gap-2 px-8 h-14 text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                <Sparkles className="h-5 w-5" />
                {t("landing.cta.getFree")}
              </Button>
            </Link>
          </div>

          {/* Compact trust signals */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-xs border-border/50 text-muted-foreground"
            >
              <Lock className="h-3 w-3" />
              Encrypted
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-xs border-border/50 text-muted-foreground"
            >
              <Eye className="h-3 w-3" />
              GDPR Ready
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-xs border-border/50 text-muted-foreground"
            >
              <Shield className="h-3 w-3" />
              Row-Level Security
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
