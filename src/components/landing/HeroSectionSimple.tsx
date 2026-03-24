import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Bot, Zap, Mail, Clock, TableProperties } from "lucide-react";
import { Link } from "react-router-dom";
import { DemoModeButton } from "@/components/DemoModeButton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const spring = { type: "spring", stiffness: 200, damping: 24 } as const;

const painPoints = [
  {
    icon: TableProperties,
    pain: "Juggling 5 tabs of spreadsheets",
    relief: "One daily AI briefing",
  },
  {
    icon: Clock,
    pain: "30 min chasing status updates",
    relief: "5-minute team pulse",
  },
  {
    icon: Mail,
    pain: "Updates lost in Slack noise",
    relief: "Curated digest in your inbox",
  },
];

export function HeroSectionSimple() {
  const { t } = useTranslation();

  return (
    <section
      className="relative min-h-[90vh] flex items-center py-20 md:py-28 px-4 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.05),transparent_50%)]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), transparent)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative mx-auto max-w-6xl z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ...spring }}
            >
              <Badge
                className="gap-2 px-5 py-2 bg-primary/[0.08] text-foreground border-primary/15 backdrop-blur-xl shadow-lg shadow-primary/5"
                variant="outline"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-medium tracking-wide">
                  For teams stuck in spreadsheets
                </span>
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              id="hero-heading"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-[-0.03em]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="block text-foreground">Stop juggling tools.</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_auto]">
                Get one daily pulse.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              SAAI pulls updates from GitHub, Jira & Slack into a single AI briefing.{" "}
              <span className="text-foreground font-normal">
                so your team starts every day aligned, not overwhelmed.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <Link to="/auth" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group relative gap-2.5 px-8 h-14 text-base font-medium w-full sm:w-auto overflow-hidden shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500"
                >
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

            {/* Trust chips */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {["2-minute setup", "No credit card", "Free tier forever"].map(
                (label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 border border-border/40 backdrop-blur-sm"
                  >
                    <Zap className="h-3 w-3 text-primary" />
                    {label}
                  </span>
                )
              )}
            </motion.div>
          </div>

          {/* Right: Pain → Relief cards */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.3, ...spring }}
          >
            <div className="relative w-full max-w-md space-y-4">
              {/* Glow */}
              <motion.div
                className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-2xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Header card */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">Your AI Chief of Staff</span>
                    <p className="text-[11px] text-muted-foreground">
                      Replaces 5 tabs with 1 briefing
                    </p>
                  </div>
                </div>

                {/* Pain → Relief rows */}
                <div className="space-y-3">
                  {painPoints.map(({ icon: Icon, pain, relief }, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground line-through decoration-destructive/50">
                          {pain}
                        </p>
                        <p className="text-sm font-medium text-foreground">{relief}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom AI insight teaser */}
              <motion.div
                className="relative p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    AI Insight
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "Sprint velocity up 15%. Consider prioritising the API rate
                  limiting before Friday's demo."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
