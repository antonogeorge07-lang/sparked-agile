import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/OptimizedImage";
import saaiLogo from "@/assets/saai-logo.png";
import { useTranslation } from "react-i18next";

export function FooterSection() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12 px-4" role="contentinfo">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-15 blur-lg rounded-full" />
                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-2 rounded-xl border border-primary/10">
                  <OptimizedImage 
                    src={saaiLogo} 
                    alt="SAAI - AI-powered Scrum Master assistant logo" 
                    className="h-8 w-8 object-contain relative z-10" 
                  />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SAAI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('landing.footer.description')}
            </p>
          </div>
          <nav aria-label="Product navigation">
            <h3 className="font-semibold mb-4">{t('landing.footer.product')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <Link to="/landing#features" className="hover:text-foreground transition-colors">
                  {t('landing.footer.features')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  {t('landing.footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-foreground transition-colors">
                  {t('landing.footer.integrations')}
                </Link>
              </li>
              {/* Pricing link hidden until monetisation is active */}
            </ul>
          </nav>
          <nav aria-label="Company navigation">
            <h3 className="font-semibold mb-4">{t('landing.footer.company')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  {t('landing.footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  {t('landing.footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  {t('landing.footer.faq')}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal navigation">
            <h3 className="font-semibold mb-4">{t('landing.footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground" role="list">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  {t('landing.footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  {t('landing.footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  {t('landing.footer.faq')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <p className="text-muted-foreground text-center md:text-left">
              {t('landing.footer.copyright', { year: currentYear })}
            </p>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" aria-hidden="true" />
              <span className="font-medium">
                {t('landing.footer.builtBy')}{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent font-semibold">
                  Antono George
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
