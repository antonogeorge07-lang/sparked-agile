import { motion } from "framer-motion";
import { Quote, Lightbulb, Heart, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const CreatorStorySection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-10 sm:py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-10"
        >
          <span className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wider">
            {t('landing.creatorStory.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 bg-gradient-primary bg-clip-text text-transparent">
            {t('landing.creatorStory.title')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-4 sm:p-6 h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                  <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{t('landing.creatorStory.problemTitle')}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {t('landing.creatorStory.problemDesc')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4 sm:p-6 h-full border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 shrink-0">
                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{t('landing.creatorStory.solutionTitle')}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {t('landing.creatorStory.solutionDesc')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 sm:gap-6"
        >
          <Card className="p-4 sm:p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{t('landing.creatorStory.philosophyTitle')}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  <span className="font-medium text-foreground">"{t('landing.creatorStory.philosophyQuote')}"</span>
                  <br />
                  {t('landing.creatorStory.philosophyDesc')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-violet-500/10 shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{t('landing.creatorStory.honestTitle')}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {t('landing.creatorStory.honestDesc')}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-10 text-center"
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('landing.creatorStory.createdBy')} <span className="font-medium text-foreground">George Antono</span> • {t('landing.creatorStory.studio')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
