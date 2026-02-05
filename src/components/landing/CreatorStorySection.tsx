import { motion } from "framer-motion";
import { Quote, Lightbulb, Heart, Target, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const CreatorStorySection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
      {/* Dramatic background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header with animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 border border-primary/30 backdrop-blur-sm mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary tracking-wide">
              {t('landing.creatorStory.badge')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-violet-500 bg-clip-text text-transparent">
              {t('landing.creatorStory.title')}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real solutions from real experience, not manufactured features
          </p>
        </motion.div>

        {/* Main story cards - 2x2 grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* The Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group"
          >
            <Card className="relative p-6 sm:p-8 h-full border-0 bg-gradient-to-br from-rose-500/10 via-card/80 to-card backdrop-blur-xl shadow-2xl shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-500 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <motion.div 
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 border border-rose-500/20"
                  >
                    <Quote className="h-6 w-6 sm:h-7 sm:w-7 text-rose-500" />
                  </motion.div>
                  <h3 className="font-bold text-xl sm:text-2xl text-foreground">
                    {t('landing.creatorStory.problemTitle')}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t('landing.creatorStory.problemDesc')}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* The Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <Card className="relative p-6 sm:p-8 h-full border-0 bg-gradient-to-br from-emerald-500/10 via-card/80 to-card backdrop-blur-xl shadow-2xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <motion.div 
                    whileHover={{ rotate: -12, scale: 1.1 }}
                    className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20"
                  >
                    <Lightbulb className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
                  </motion.div>
                  <h3 className="font-bold text-xl sm:text-2xl text-foreground">
                    {t('landing.creatorStory.solutionTitle')}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t('landing.creatorStory.solutionDesc')}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Philosophy Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group"
          >
            <Card className="relative p-6 sm:p-8 h-full border-0 bg-gradient-to-br from-amber-500/10 via-card/80 to-card backdrop-blur-xl shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <motion.div 
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20"
                  >
                    <Target className="h-6 w-6 sm:h-7 sm:w-7 text-amber-500" />
                  </motion.div>
                  <h3 className="font-bold text-xl sm:text-2xl text-foreground">
                    {t('landing.creatorStory.philosophyTitle')}
                  </h3>
                </div>
                <blockquote className="text-base sm:text-lg font-semibold text-foreground mb-3 pl-4 border-l-4 border-amber-500/50">
                  "{t('landing.creatorStory.philosophyQuote')}"
                </blockquote>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t('landing.creatorStory.philosophyDesc')}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Honest About Limits Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group"
          >
            <Card className="relative p-6 sm:p-8 h-full border-0 bg-gradient-to-br from-violet-500/10 via-card/80 to-card backdrop-blur-xl shadow-2xl shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-500 overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-colors duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <motion.div 
                    whileHover={{ rotate: -12, scale: 1.1 }}
                    className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20"
                  >
                    <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-violet-500" />
                  </motion.div>
                  <h3 className="font-bold text-xl sm:text-2xl text-foreground">
                    {t('landing.creatorStory.honestTitle')}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t('landing.creatorStory.honestDesc')}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Creator signature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-card/80 to-muted/50 border border-border/50 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              {t('landing.creatorStory.createdBy')}{' '}
              <span className="font-semibold text-foreground">George Antono</span>
              {' '}•{' '}
              <span className="text-primary">{t('landing.creatorStory.studio')}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
