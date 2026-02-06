import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const InteractivePreview = () => {
  const { t } = useTranslation();
  const [activeConversation, setActiveConversation] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const sampleConversations = [
    {
      user: t('landing.interactivePreview.conversations.q1', "What blockers does my team have this week?"),
      ai: t('landing.interactivePreview.conversations.a1', "Based on your standup data: 3 blockers identified. Sarah is waiting on API docs, Mike needs design approval, and the deployment pipeline has a failing test. Want me to prioritize these?"),
    },
    {
      user: t('landing.interactivePreview.conversations.q2', "Help me plan next sprint"),
      ai: t('landing.interactivePreview.conversations.a2', "Looking at your velocity (24 pts/sprint avg) and backlog: I recommend pulling 8 stories totaling 26 points. This includes 2 high-priority bug fixes and 6 feature items. Should I draft the sprint goal?"),
    },
    {
      user: t('landing.interactivePreview.conversations.q3', "Summarize yesterday's standup"),
      ai: t('landing.interactivePreview.conversations.a3', "5 team members reported. Key updates: Frontend auth flow complete, backend API 80% done. 1 new blocker (database migration). Overall team velocity on track for sprint commitment."),
    },
  ];

  const handleNext = () => {
    setIsTyping(true);
    setTimeout(() => {
      setActiveConversation((prev) => (prev + 1) % sampleConversations.length);
      setIsTyping(false);
    }, 500);
  };

  return (
    <section className="py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('landing.interactivePreview.badge')}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {t('landing.interactivePreview.title')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-lg mx-auto px-2">
            {t('landing.interactivePreview.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-b from-background to-muted/20">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 rounded-lg bg-primary/10">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span className="font-medium text-xs sm:text-sm">Omair AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">{t('landing.interactivePreview.online')}</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-3 sm:p-4 min-h-[180px] sm:min-h-[200px] space-y-3 sm:space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConversation}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[80%]">
                      <p className="text-xs sm:text-sm">{sampleConversations[activeConversation].user}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-muted px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-tl-sm max-w-[90%] sm:max-w-[85%]">
                      {isTyping ? (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm">{sampleConversations[activeConversation].ai}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex gap-1 order-2 sm:order-1">
                {sampleConversations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveConversation(idx)}
                    className={`h-1.5 rounded-full transition-all min-h-0 min-w-0 ${
                      idx === activeConversation ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`View example ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                <Button variant="ghost" size="sm" onClick={handleNext} className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-auto min-h-9">
                  {t('landing.interactivePreview.nextExample')}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')} className="flex-1 sm:flex-none gap-1.5 text-xs sm:text-sm h-9 sm:h-auto min-h-9">
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {t('landing.interactivePreview.tryFullChat')}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Feature hints */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2"
        >
          {[
            t('landing.interactivePreview.features.sprintPlanning'),
            t('landing.interactivePreview.features.standupSummaries'),
            t('landing.interactivePreview.features.blockerDetection'),
            t('landing.interactivePreview.features.velocityInsights')
          ].map((feature) => (
            <span
              key={feature}
              className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-muted text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
