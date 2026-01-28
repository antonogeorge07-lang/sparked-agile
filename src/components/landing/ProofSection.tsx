import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, CheckCircle2, Mail, GitBranch, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
interface ProofSectionProps {
  onWatchDemo: () => void;
}
export function ProofSection({
  onWatchDemo
}: ProofSectionProps) {
  const {
    t
  } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const steps = [{
    labelKey: "landing.proof.stepConnect",
    descKey: "landing.proof.stepConnectDesc"
  }, {
    labelKey: "landing.proof.stepConfigure",
    descKey: "landing.proof.stepConfigureDesc"
  }, {
    labelKey: "landing.proof.stepReceive",
    descKey: "landing.proof.stepReceiveDesc"
  }];
  return <section className="py-20 px-4" aria-labelledby="proof-heading">
      <div className="container mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Interactive steps */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-4 border-tier-free/30 text-tier-free gap-1.5">
                <Clock className="h-3 w-3" />
                {t('landing.proof.setupTime')}
              </Badge>
              <h2 id="proof-heading" className="text-3xl md:text-4xl font-bold font-heading mb-4">
                {t('landing.proof.title')}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t('landing.proof.subtitle')}
              </p>
            </div>

            {/* Interactive step indicators */}
            <div className="space-y-3">
              {steps.map((step, i) => <button key={i} className={`w-full text-left p-4 rounded-xl transition-all duration-300 group
                    ${activeStep === i ? 'bg-tier-free/10 border-2 border-tier-free/30 shadow-sm' : 'bg-muted/50 border-2 border-transparent hover:bg-muted'}`} onMouseEnter={() => setActiveStep(i)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${activeStep === i ? 'bg-tier-free text-tier-free-foreground scale-110' : 'bg-muted-foreground/20 text-muted-foreground group-hover:bg-muted-foreground/30'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{t(step.labelKey)}</div>
                      <div className={`text-sm transition-all duration-300 ${activeStep === i ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t(step.descKey)}
                      </div>
                    </div>
                    {activeStep === i && <CheckCircle2 className="h-5 w-5 text-tier-free ml-auto animate-scale-in" />}
                  </div>
                </button>)}
            </div>

            <div className="flex-col sm:flex-row gap-3 pt-2 flex items-start justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2 w-full sm:w-auto bg-tier-free hover:bg-tier-free/90 text-center">
                  {t('landing.proof.getStarted')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
            </div>
          </div>

          {/* Right: Animated email preview */}
          <Card className="relative p-1 bg-gradient-to-br from-tier-free/10 via-transparent to-primary/10 border-tier-free/20 overflow-hidden group">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="bg-card rounded-lg p-6 space-y-4">
              {/* Email header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                    <Mail className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{t('landing.proof.emailTitle')}</div>
                    <div className="text-xs text-muted-foreground">{t('landing.proof.emailFrom')}</div>
                  </div>
                </div>
                <Badge className="bg-tier-free/10 text-tier-free border-tier-free/20 text-xs animate-pulse">
                  {t('common.new')}
                </Badge>
              </div>
              
              {/* Email content cards */}
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-default group/card">
                  <div className="flex items-center gap-3 mb-2">
                    <GitBranch className="h-5 w-5 text-tier-free" />
                    <span className="font-medium">{t('landing.proof.commitsMerged')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('landing.proof.commitsDesc')}</p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-default">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-tier-free" />
                    <span className="font-medium">{t('landing.proof.tasksCompleted')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('landing.proof.tasksDesc')}</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-tier-free/10 to-primary/5 rounded-xl border border-tier-free/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-tier-free" />
                    <span className="text-sm font-medium text-tier-free">{t('landing.proof.aiSummaryLabel')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('landing.proof.aiSummaryText')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>;
}