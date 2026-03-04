import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Bot, Send, Zap, Brain, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

const demoConversations = [
  {
    userKey: "What blockers does my team have?",
    aiKey: "3 blockers found: Sarah needs API docs, Mike awaits design approval, and a failing pipeline test. Want me to prioritise these?",
  },
  {
    userKey: "Generate test scenarios for login",
    aiKey: "6 scenarios ready: 3 happy-path, 2 edge-cases, 1 security test. Shall I export them to your backlog?",
  },
  {
    userKey: "Forecast next sprint capacity",
    aiKey: "Avg velocity: 24 pts over 6 sprints. Recommended: 22 pts (1 member on leave). Overcommit risk: 12%.",
  },
  {
    userKey: "Summarise yesterday's retro",
    aiKey: "3 wins (faster CI, better reviews, improved standups). 2 action items created and assigned to next sprint.",
  },
];

// Floating particle component
const FloatingParticle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 blur-sm"
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Typing character-by-character animation
const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 12 + Math.random() * 18);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-[2px] h-[14px] bg-primary ml-[1px] align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
};

// Animated gradient orb
const GradientOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

export function HeroSectionSimple() {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const backgroundX = useTransform(mouseX, [0, window.innerWidth], [10, -10]);
  const backgroundY = useTransform(mouseY, [0, window.innerHeight], [10, -10]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  // Auto-cycle conversations
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setIsTyping(true);
      setShowResponse(false);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % demoConversations.length);
        setIsTyping(false);
      }, 500);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const handleNext = () => {
    setAutoPlay(false);
    setIsTyping(true);
    setShowResponse(false);
    setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % demoConversations.length);
      setIsTyping(false);
    }, 400);
    setTimeout(() => setAutoPlay(true), 15000);
  };

  const handleDotClick = (idx: number) => {
    setAutoPlay(false);
    setIsTyping(true);
    setShowResponse(false);
    setTimeout(() => {
      setActiveIdx(idx);
      setIsTyping(false);
    }, 300);
    setTimeout(() => setAutoPlay(true), 15000);
  };

  const capabilities = [
    { icon: Brain, label: "AI Sprint Planning", delay: 0 },
    { icon: Shield, label: "Test Scenario Gen", delay: 0.08 },
    { icon: Users, label: "Team Intelligence", delay: 0.16 },
    { icon: Zap, label: "Smart Nudges", delay: 0.24 },
  ];

  const particles = [
    { delay: 0, duration: 4, x: "10%", y: "20%", size: 6 },
    { delay: 1.5, duration: 5, x: "85%", y: "15%", size: 4 },
    { delay: 0.8, duration: 4.5, x: "70%", y: "70%", size: 5 },
    { delay: 2, duration: 3.5, x: "25%", y: "80%", size: 3 },
    { delay: 1, duration: 4, x: "50%", y: "10%", size: 4 },
    { delay: 2.5, duration: 5, x: "90%", y: "50%", size: 5 },
  ];

  return (
    <section
      className="relative min-h-[95vh] flex items-center py-20 md:py-28 px-4 overflow-hidden"
      aria-labelledby="hero-heading"
      onMouseMove={handleMouseMove}
    >
      {/* Cinematic background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

      {/* Animated gradient orbs */}
      <motion.div style={{ x: backgroundX, y: backgroundY }} className="absolute inset-0">
        <GradientOrb className="w-[600px] h-[600px] -top-40 -right-40 bg-primary/[0.04]" />
        <GradientOrb className="w-[500px] h-[500px] -bottom-32 -left-32 bg-accent/[0.05]" />
        <GradientOrb className="w-[300px] h-[300px] top-1/3 left-1/2 bg-secondary/[0.03]" />
      </motion.div>

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      {/* Ambient glow line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), transparent)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative mx-auto max-w-7xl z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge
                className="gap-2 px-5 py-2 bg-primary/[0.08] text-foreground border-primary/15 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
                variant="outline"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-medium tracking-wide">{t("landing.hero.badge")}</span>
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              id="hero-heading"
              className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.04] tracking-[-0.03em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <motion.span
                className="block text-foreground"
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                Your Agile
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_auto]"
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  backgroundPosition: ["0% center", "100% center", "0% center"],
                }}
                transition={{
                  opacity: { duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] },
                  filter: { duration: 0.8, delay: 0.25 },
                  backgroundPosition: { duration: 8, delay: 1.5, repeat: Infinity, ease: "linear" },
                }}
              >
                Co-Pilot.
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              18 specialist AI agents handle sprint planning, retros, forecasting and more,
              <span className="text-foreground font-normal"> so you ship value, not paperwork.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/auth" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group relative gap-2.5 px-8 h-14 text-base font-medium w-full sm:w-auto overflow-hidden transition-all duration-500 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                  />
                  <Sparkles className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{t("landing.hero.cta")}</span>
                  <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <DemoModeButton />
            </motion.div>

            {/* Capability chips */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {capabilities.map(({ icon: Icon, label, delay }, i) => (
                <motion.div
                  key={label}
                  className="group flex items-center gap-2 text-xs text-muted-foreground px-4 py-2 rounded-full bg-card/60 border border-border/40 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/[0.05] hover:text-foreground transition-all duration-300 cursor-default"
                  initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, delay: 0.75 + delay, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Icon className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Interactive demo chat */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full max-w-md">
              {/* Card glow */}
              <motion.div
                className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-sm"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative w-full overflow-hidden rounded-2xl border border-border/50 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-primary/[0.08]">
                {/* Chat header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-muted/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/10"
                      animate={{ boxShadow: ["0 0 0px hsl(var(--primary) / 0)", "0 0 15px hsl(var(--primary) / 0.15)", "0 0 0px hsl(var(--primary) / 0)"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Bot className="h-4 w-4 text-primary" />
                    </motion.div>
                    <div>
                      <span className="font-semibold text-sm tracking-tight">Omair AI</span>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">Active now</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2.5 py-1 bg-primary/[0.08] text-primary border border-primary/10 font-medium tracking-wide"
                  >
                    LIVE
                  </Badge>
                </div>

                {/* Chat messages */}
                <div className="p-5 min-h-[240px] space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-4"
                    >
                      {/* User bubble */}
                      <div className="flex justify-end">
                        <motion.div
                          className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-md max-w-[80%] shadow-lg shadow-primary/15"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                        >
                          <p className="text-sm font-medium">{demoConversations[activeIdx].userKey}</p>
                        </motion.div>
                      </div>

                      {/* AI thinking indicator + response */}
                      <div className="flex justify-start">
                        <motion.div
                          className="bg-muted/60 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-tl-md max-w-[88%] border border-border/30"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          {isTyping ? (
                            <div className="flex items-center gap-2 py-0.5">
                              <div className="flex gap-1">
                                {[0, 150, 300].map((d) => (
                                  <motion.span
                                    key={d}
                                    className="w-1.5 h-1.5 bg-primary/50 rounded-full"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 0.6, delay: d / 1000, repeat: Infinity }}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">Thinking...</span>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">
                              <TypewriterText
                                text={demoConversations[activeIdx].aiKey}
                                onComplete={() => setShowResponse(true)}
                              />
                            </p>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Chat footer */}
                <div className="px-5 py-3.5 border-t border-border/30 bg-muted/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {/* Progress dots */}
                    <div className="flex gap-1.5 flex-1">
                      {demoConversations.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleDotClick(idx)}
                          className="relative group"
                          aria-label={`Example ${idx + 1}`}
                        >
                          <motion.span
                            className={`block h-1.5 rounded-full transition-all duration-500 ${
                              idx === activeIdx
                                ? "w-7 bg-primary"
                                : "w-1.5 bg-muted-foreground/20 group-hover:bg-muted-foreground/40"
                            }`}
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      className="text-xs gap-1.5 h-8 px-3 hover:bg-primary/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </Button>

                    <Link to="/auth">
                      <Button
                        size="sm"
                        className="text-xs gap-1.5 h-8 px-4 shadow-md shadow-primary/10"
                      >
                        <Send className="h-3 w-3" />
                        Try It
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Auto-play progress bar */}
                {autoPlay && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary to-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    key={`progress-${activeIdx}`}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
