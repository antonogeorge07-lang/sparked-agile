import { FeedbackSubmissionForm } from "@/components/FeedbackSubmissionForm";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { MessageSquareHeart, Sparkles } from "lucide-react";

export function FeedbackSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 px-4 overflow-hidden" aria-labelledby="feedback-heading">
      {/* Dramatic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.06),transparent_50%)]" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.header 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <MessageSquareHeart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Community Voices</span>
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          </motion.div>

          <h2 
            id="feedback-heading" 
            className="text-4xl md:text-5xl font-bold mb-5 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            {t('landing.feedback.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('landing.feedback.subtitle')}
          </p>
        </motion.header>
        
        {/* Form Section */}
        <motion.div 
          className="mb-20 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FeedbackSubmissionForm />
        </motion.div>

        {/* Display Section Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl md:text-3xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {t('landing.feedback.communityTitle')}
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('landing.feedback.communitySubtitle')}
          </p>
        </motion.div>
        
        {/* Feedback Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <FeedbackDisplay />
        </motion.div>
      </div>
    </section>
  );
}
