import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Play, Sparkles, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const sampleConversations = [
  {
    user: "What blockers does my team have this week?",
    ai: "Based on your standup data: 3 blockers identified. Sarah is waiting on API docs, Mike needs design approval, and the deployment pipeline has a failing test. Want me to prioritize these?",
  },
  {
    user: "Help me plan next sprint",
    ai: "Looking at your velocity (24 pts/sprint avg) and backlog: I recommend pulling 8 stories totaling 26 points. This includes 2 high-priority bug fixes and 6 feature items. Should I draft the sprint goal?",
  },
  {
    user: "Summarize yesterday's standup",
    ai: "5 team members reported. Key updates: Frontend auth flow complete, backend API 80% done. 1 new blocker (database migration). Overall team velocity on track for sprint commitment.",
  },
];

export const InteractivePreview = () => {
  const [activeConversation, setActiveConversation] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    setIsTyping(true);
    setTimeout(() => {
      setActiveConversation((prev) => (prev + 1) % sampleConversations.length);
      setIsTyping(false);
    }, 500);
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            <Sparkles className="h-4 w-4" />
            Try It Live
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            See How Omair Works
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Real AI responses based on actual platform capabilities
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm">Omair AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-4 min-h-[200px] space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeConversation}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                      <p className="text-sm">{sampleConversations[activeConversation].user}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                      {isTyping ? (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <p className="text-sm">{sampleConversations[activeConversation].ai}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <div className="flex gap-1">
                {sampleConversations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveConversation(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeConversation ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleNext}>
                  Next Example
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')} className="gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Try Full Chat
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
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {['Sprint Planning', 'Standup Summaries', 'Blocker Detection', 'Velocity Insights'].map((feature) => (
            <span
              key={feature}
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
