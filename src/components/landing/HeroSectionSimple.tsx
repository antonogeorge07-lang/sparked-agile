import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Bot, Send, Zap, Brain, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const demoConversations = [
{
  userKey: "What blockers does my team have?",
  aiKey: "3 blockers found: Sarah needs API docs, Mike awaits design approval, and a failing pipeline test. Want me to prioritise these?"
},
{
  userKey: "Generate test scenarios for login",
  aiKey: "6 scenarios ready: 3 happy-path, 2 edge-cases, 1 security test. Shall I export them to your backlog?"
},
{
  userKey: "Forecast next sprint capacity",
  aiKey: "Avg velocity: 24 pts over 6 sprints. Recommended: 22 pts (1 member on leave). Overcommit risk: 12%."
},
{
  userKey: "Summarise yesterday's retro",
  aiKey: "3 wins (faster CI, better reviews, improved standups). 2 action items created and assigned to next sprint."
}];


export function HeroSectionSimple() {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const handleNext = () => {
    setIsTyping(true);
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % demoConversations.length);
      setIsTyping(false);
    }, 400);
  };

  const capabilities = [
  { icon: Brain, label: "AI Sprint Planning" },
  { icon: Shield, label: "Test Scenario Gen" },
  { icon: Users, label: "Team Intelligence" },
  { icon: Zap, label: "Smart Nudges" }];


  return (
    <section
      className="relative min-h-[90vh] flex items-center py-16 md:py-24 px-4 overflow-hidden"
      aria-labelledby="hero-heading">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.06),transparent_60%)]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px"
        }} />


      <div className="container relative mx-auto max-w-6xl z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}>

              <Badge
                className="gap-2 px-4 py-1.5 bg-primary/10 text-foreground border-primary/20 backdrop-blur-sm shadow-sm"
                variant="outline">

                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-xs font-medium">{t("landing.hero.badge")}</span>
              </Badge>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}>

              <span className="block text-foreground">Your Agile
Co-Pilot.
              </span>
              <span className="block mt-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Always On.
Always Smart.
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}>

              18 specialist AI agents handle sprint planning, retros, forecasting and more,
              so you focus on delivering value, not admin.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}>

              <Link to="/auth" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="gap-2 px-8 h-13 text-base font-medium w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">

                  <Sparkles className="h-4 w-4" />
                  {t("landing.hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <DemoModeButton />
            </motion.div>

            {/* Capability chips */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-3 pt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}>

              {capabilities.map(({ icon: Icon, label }, i) =>
              <motion.div
                key={label}
                className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted/60 border border-border/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.08 }}>

                  <Icon className="h-3 w-3 text-primary" />
                  {label}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right: Interactive demo chat */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}>

            <Card className="w-full max-w-md overflow-hidden border border-border/80 bg-card/80 backdrop-blur-md shadow-2xl">
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">Omair AI Assistant</span>
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">Online</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-0">
                  Live Preview
                </Badge>
              </div>

              {/* Chat messages */}
              <div className="p-4 min-h-[220px] space-y-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIdx}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3">

                    {/* User bubble */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                        <p className="text-sm">{demoConversations[activeIdx].userKey}</p>
                      </div>
                    </div>

                    {/* AI bubble */}
                    <div className="flex justify-start">
                      <div className="bg-muted px-3.5 py-2.5 rounded-2xl rounded-tl-sm max-w-[88%]">
                        {isTyping ?
                        <div className="flex gap-1 py-1">
                            {[0, 150, 300].map((d) =>
                          <span
                            key={d}
                            className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />

                          )}
                          </div> :

                        <p className="text-sm leading-relaxed">{demoConversations[activeIdx].aiKey}</p>
                        }
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Chat footer */}
              <div className="px-4 py-3 border-t border-border/60 bg-muted/20">
                <div className="flex items-center gap-2">
                  {/* Dot indicators */}
                  <div className="flex gap-1 flex-1">
                    {demoConversations.map((_, idx) =>
                    <button
                      key={idx}
                      onClick={() => {setIsTyping(true);setTimeout(() => {setActiveIdx(idx);setIsTyping(false);}, 300);}}
                      className={`h-1.5 rounded-full transition-all ${
                      idx === activeIdx ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"}`
                      }
                      aria-label={`Example ${idx + 1}`} />

                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="text-xs gap-1 h-8">

                    Next
                    <ArrowRight className="h-3 w-3" />
                  </Button>

                  <Link to="/auth">
                    <Button size="sm" className="text-xs gap-1 h-8">
                      <Send className="h-3 w-3" />
                      Try It
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>);

}