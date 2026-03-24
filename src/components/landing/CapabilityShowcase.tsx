import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Mail, Brain, Kanban, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function CapabilityShowcase() {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const capabilities = [
    {
      icon: Mail,
      title: "AI Daily Digest",
      desc: "One morning email with commits, task updates, blockers & AI recommendations. No logins needed.",
      tier: "free" as const,
      accent: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: Kanban,
      title: "Native PM Board",
      desc: "Built-in Kanban, sprints & backlog. Ditch the spreadsheets without learning Jira.",
      tier: "free" as const,
      accent: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
      iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500/20",
      iconColor: "text-indigo-400",
    },
    {
      icon: Brain,
      title: "AI Co-Pilot",
      desc: "Sprint planning, test scenario generation, blocker detection & capacity forecasting, all AI-driven.",
      tier: "free" as const,
      accent: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
      iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
      iconColor: "text-violet-400",
    },
    {
      icon: MessageCircle,
      title: "Team Hub",
      desc: "Real-time workspace chat and task-level discussions. No more context-switching to Slack.",
      tier: "free" as const,
      accent: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
      iconBg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <section id="features" className="relative py-24 px-4 overflow-hidden" aria-labelledby="capabilities-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_50%)]" />

      <div className="container relative mx-auto max-w-5xl">
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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">What you get</span>
          </motion.div>

          <h2
            id="capabilities-heading"
            className="text-4xl md:text-5xl font-bold mb-5 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            Replace 5 tools with one platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything a small team needs — without the overhead of enterprise software.
          </p>
        </motion.header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {capabilities.map((cap, index) => {
            const isHovered = hoveredCard === index;
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${cap.accent} rounded-2xl blur-xl transition-opacity duration-500 ${isHovered ? "opacity-70" : "opacity-0"}`}
                />
                <div
                  className={`relative h-full p-6 rounded-2xl border backdrop-blur-sm bg-card/80 transition-all duration-300 ${isHovered ? "border-border shadow-2xl scale-[1.02]" : "border-border/50 hover:border-border"}`}
                >
                  <div className={`absolute top-0 left-6 right-6 h-px transition-opacity duration-300 bg-gradient-to-r from-transparent via-primary/40 to-transparent ${isHovered ? "opacity-100" : "opacity-0"}`} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${cap.iconBg}`}
                        animate={isHovered ? { rotate: -5, scale: 1.1 } : { rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <cap.icon className={`h-6 w-6 ${cap.iconColor}`} />
                      </motion.div>
                      <TierBadge tier={cap.tier} className="text-xs" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-foreground transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 group px-8 h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <Link to="/features">
              {t("landing.capabilities.seeAllFeatures")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
