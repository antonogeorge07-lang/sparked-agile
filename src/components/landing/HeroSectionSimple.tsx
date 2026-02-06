import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, CheckCircle, Zap, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion } from "framer-motion";
export function HeroSectionSimple() {
  const {
    t
  } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const trustPoints = [{
    key: 'landing.hero.setup',
    icon: Zap
  }, {
    key: 'landing.hero.noCreditCard',
    icon: CheckCircle
  }, {
    key: 'landing.hero.freeForever',
    icon: Sparkles
  }];
  return <section className="relative min-h-[85vh] flex items-center py-20 md:py-28 px-4 overflow-hidden" aria-labelledby="hero-heading">
      {/* Dramatic background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_50%)]" />
      
      {/* Animated orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-float" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-float animation-delay-500" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-primary/8 rounded-full blur-[80px] animate-float animation-delay-300" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
      backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
      backgroundSize: '60px 60px'
    }} />
      
      <div className="container relative mx-auto max-w-5xl z-10">
        <div className="text-center space-y-8">
          {/* Premium badge */}
          <motion.div className="inline-flex" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <Badge className="gap-2.5 px-5 py-2 bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border-primary/20 backdrop-blur-sm cursor-default shadow-lg" variant="outline">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{t('landing.hero.badge')}</span>
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            </Badge>
          </motion.div>

          {/* Hero headline with dramatic typography */}
          <motion.h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.7,
          delay: 0.1
        }}>
            <span className="block bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Spark-Agile
            </span>
            <span className="block mt-1 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Active Intelligence
            </span>
            <motion.span className="block mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-muted-foreground" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }}>
              {t('landing.hero.title2')}
            </motion.span>
          </motion.h1>

          {/* Value proposition */}
          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }}>
            {t('landing.hero.description')}
          </motion.p>

          {/* CTA group */}
          <motion.div className="relative inline-flex flex-col sm:flex-row gap-4 pt-4" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {/* Glow effect behind primary CTA */}
            
            
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className={`
                  relative gap-2.5 px-8 h-14 text-base font-medium w-full sm:w-auto
                  bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary
                  shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30
                  transition-all duration-300 ${isHovered ? 'scale-105' : ''}
                `}>
                <Sparkles className="h-5 w-5" />
                {t('landing.hero.cta')}
                <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
            </Link>
            <DemoModeButton />
          </motion.div>

          {/* Trust indicators */}
          <motion.div className="flex flex-wrap justify-center gap-6 pt-6" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.6
        }}>
            {trustPoints.map(({
            key,
            icon: Icon
          }, index) => <motion.div key={key} className="flex items-center gap-2 text-sm text-muted-foreground" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.7 + index * 0.1
          }}>
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{t(key)}</span>
              </motion.div>)}
          </motion.div>
        </div>
      </div>
    </section>;
}