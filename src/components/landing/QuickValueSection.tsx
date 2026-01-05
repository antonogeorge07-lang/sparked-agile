import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const QuickValueSection = () => {
  const { t } = useTranslation();

  const benefits = [
    t('landing.quickValue.benefit1'),
    t('landing.quickValue.benefit2'),
    t('landing.quickValue.benefit3'),
    t('landing.quickValue.benefit4'),
    t('landing.quickValue.benefit5'),
    t('landing.quickValue.benefit6')
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30" aria-label="Quick value proposition">
      <div className="container mx-auto max-w-5xl">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-3">
                    {t('landing.quickValue.title')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('landing.quickValue.subtitle')}
                  </p>
                </div>
                
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button size="lg" className="w-full md:w-auto gap-2 group">
                    {t('landing.quickValue.cta')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary mb-2">{t('landing.quickValue.quickSetup')}</div>
                    <p className="text-sm text-muted-foreground">{t('landing.quickValue.quickSetupDesc')}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-green-500 mb-2">{t('landing.quickValue.aiPowered')}</div>
                    <p className="text-sm text-muted-foreground">{t('landing.quickValue.aiPoweredDesc')}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-blue-500 mb-2">{t('landing.quickValue.timeSaver')}</div>
                    <p className="text-sm text-muted-foreground">{t('landing.quickValue.timeSaverDesc')}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};