import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Mail, GitBranch, Clock, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface ProofSectionProps {
  onWatchDemo: () => void;
}

export function ProofSection({ onWatchDemo }: ProofSectionProps) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      labelKey: "landing.proof.stepConnect",
      descKey: "landing.proof.stepConnectDesc",
      icon: <GitBranch className="h-4 w-4" />,
      color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30"
    },
    {
      labelKey: "landing.proof.stepConfigure",
      descKey: "landing.proof.stepConfigureDesc",
      icon: <Zap className="h-4 w-4" />,
      color: "from-amber-500/20 to-amber-500/5 border-amber-500/30"
    },
    {
      labelKey: "landing.proof.stepReceive",
      descKey: "landing.proof.stepReceiveDesc",
      icon: <Mail className="h-4 w-4" />,
      color: "from-blue-500/20 to-blue-500/5 border-blue-500/30"
    }
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden" aria-labelledby="proof-heading">
      {/* Dramatic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_left,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.06),transparent_50%)]" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Interactive steps */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="outline" className="mb-5 px-4 py-2 border-primary/30 bg-primary/5 text-primary gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {t('landing.proof.setupTime')}
                  <Sparkles className="h-3 w-3 animate-pulse" />
                </Badge>
              </motion.div>
              
              <h2 
                id="proof-heading" 
                className="text-4xl md:text-5xl font-bold mb-5 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
              >
                {t('landing.proof.title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('landing.proof.subtitle')}
              </p>
            </div>

            {/* Interactive step indicators */}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <motion.button
                  key={i}
                  className={`
                    relative w-full text-left p-5 rounded-2xl transition-all duration-300 group overflow-hidden
                    ${activeStep === i 
                      ? 'bg-gradient-to-r ' + step.color + ' border shadow-lg' 
                      : 'bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card hover:border-border'
                    }
                  `}
                  onMouseEnter={() => setActiveStep(i)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Accent line */}
                  {activeStep === i && (
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl"
                      layoutId="stepAccent"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${activeStep === i 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                        : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/20'
                      }
                    `}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base mb-0.5">{t(step.labelKey)}</div>
                      <div className={`text-sm transition-all duration-300 ${activeStep === i ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                        {t(step.descKey)}
                      </div>
                    </div>
                    <AnimatePresence>
                      {activeStep === i && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="p-2 rounded-full bg-primary/10"
                        >
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="gap-2 h-13 px-8 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 transition-all duration-300"
                >
                  {t('landing.proof.getStarted')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Animated email preview */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Card */}
            <div className="relative bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 shadow-2xl overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              <div className="bg-gradient-to-b from-background to-background/80 rounded-xl p-6 space-y-5">
                {/* Email header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Mail className="h-5 w-5 text-primary-foreground" />
                      </div>
                      {/* Pulse ring */}
                      <div className="absolute -inset-1 rounded-xl border-2 border-primary/30 animate-ping opacity-30" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{t('landing.proof.emailTitle')}</div>
                      <div className="text-sm text-muted-foreground">{t('landing.proof.emailFrom')}</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    {t('common.new')}
                  </Badge>
                </div>
                
                {/* Email content cards */}
                <div className="space-y-3">
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-default group/card"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <GitBranch className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="font-medium">{t('landing.proof.commitsMerged')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">{t('landing.proof.commitsDesc')}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-default"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="font-medium">{t('landing.proof.tasksCompleted')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">{t('landing.proof.tasksDesc')}</p>
                  </motion.div>
                  
                  <motion.div 
                    className="relative p-5 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-xl border border-primary/30 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {/* Sparkle accent */}
                    <div className="absolute top-3 right-3">
                      <Sparkles className="h-5 w-5 text-primary/40 animate-pulse" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">{t('landing.proof.aiSummaryLabel')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                      {t('landing.proof.aiSummaryText')}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
