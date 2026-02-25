import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Brain,
  MessageSquare,
  BarChart3,
  GitBranch,
  FlaskConical,
  FileText,
  TrendingUp,
  Bell,
  Zap,
  Target,
  Users,
  Calendar,
  Shield,
  Layers,
  RefreshCw,
  Lightbulb,
  Workflow,
  Video,
} from "lucide-react";

const agents = [
  { name: "AI Co-Pilot", icon: Brain, color: "221 83% 53%" },
  { name: "Omair", icon: MessageSquare, color: "262 83% 58%" },
  { name: "Sprint Planner", icon: Target, color: "172 66% 50%" },
  { name: "Retro Insights", icon: Lightbulb, color: "38 92% 50%" },
  { name: "Backlog Health", icon: BarChart3, color: "152 76% 45%" },
  { name: "GitHub Digest", icon: GitBranch, color: "0 0% 40%" },
  { name: "Test Scenarios", icon: FlaskConical, color: "280 83% 65%" },
  { name: "Meeting Actions", icon: FileText, color: "200 80% 50%" },
  { name: "Resource Forecast", icon: TrendingUp, color: "340 75% 55%" },
  { name: "Smart Nudges", icon: Bell, color: "45 93% 47%" },
  { name: "Epic Validator", icon: Shield, color: "221 83% 43%" },
  { name: "Standup Summary", icon: Users, color: "152 60% 40%" },
  { name: "Video Script", icon: Video, color: "0 72% 51%" },
  { name: "Workflow Router", icon: Workflow, color: "262 60% 50%" },
  { name: "Sprint Review", icon: RefreshCw, color: "200 65% 45%" },
  { name: "Calendar Sync", icon: Calendar, color: "172 76% 42%" },
  { name: "Project Insights", icon: Zap, color: "38 80% 55%" },
  { name: "Portfolio Manager", icon: Layers, color: "280 65% 55%" },
];

export function AgentOrbit() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % agents.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const activeAgent = agents[activeIndex];
  const ActiveIcon = activeAgent.icon;

  // Show 5 agents in the visible ring at any time
  const visibleCount = 5;
  const visibleAgents = Array.from({ length: visibleCount }, (_, i) => {
    const idx = (activeIndex + i) % agents.length;
    return { ...agents[idx], idx };
  });

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border border-primary/10" />
      <div className="absolute inset-4 rounded-full border border-primary/5" />

      {/* Orbiting agent pills */}
      {visibleAgents.map((agent, i) => {
        const angle = (i / visibleCount) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const radius = 42; // percentage from center
        const x = 50 + radius * Math.cos(rad);
        const y = 50 + radius * Math.sin(rad);
        const isActive = i === 0;

        return (
          <motion.div
            key={agent.idx}
            className="absolute flex items-center gap-1.5 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: isActive ? 1 : 0.5,
              scale: isActive ? 1 : 0.75,
            }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium
                backdrop-blur-sm border whitespace-nowrap
                ${isActive
                  ? "bg-primary/15 border-primary/30 text-foreground shadow-lg"
                  : "bg-card/60 border-border/50 text-muted-foreground"
                }
              `}
            >
              <agent.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">{agent.name}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Center active agent */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="p-4 rounded-2xl border border-primary/20 shadow-lg"
              style={{
                background: `linear-gradient(135deg, hsl(${activeAgent.color} / 0.15), hsl(${activeAgent.color} / 0.05))`,
              }}
            >
              <ActiveIcon
                className="h-8 w-8"
                style={{ color: `hsl(${activeAgent.color})` }}
              />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {activeAgent.name}
            </span>
            <span className="text-[11px] text-muted-foreground">Active Agent</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Counter badge */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-xs font-medium text-primary">
          {activeIndex + 1}/{agents.length} Agents
        </span>
      </motion.div>
    </div>
  );
}
