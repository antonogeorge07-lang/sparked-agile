import { Lightbulb, Sparkles, MessagesSquare, ShieldCheck, Layers } from "lucide-react";

const STAGES = [
  {
    key: "define",
    title: "Define",
    tag: "01",
    icon: Lightbulb,
    description:
      "Capture intent with clarity. Spark-Agile turns goals, charters, and epics into structured outcomes the team can act on.",
  },
  {
    key: "refine",
    title: "Refine",
    tag: "02",
    icon: Sparkles,
    description:
      "AI specialists shape scope, surface risks, and tighten the backlog before a single sprint starts.",
  },
  {
    key: "interact",
    title: "Interact",
    tag: "03",
    icon: MessagesSquare,
    description:
      "Multi-agent debate, smart nudges, and live ceremonies keep the team in rhythm without constant status meetings.",
  },
  {
    key: "verify",
    title: "Verify",
    tag: "04",
    icon: ShieldCheck,
    description:
      "Continuous validation across flow metrics, ROI, and execution readiness. Decisions stay evidence-led.",
  },
  {
    key: "embed",
    title: "Embed",
    tag: "05",
    icon: Layers,
    description:
      "Lessons, retrospectives, and knowledge are captured back into the platform so every cycle compounds.",
  },
] as const;

export function MethodSection() {
  return (
    <section
      className="py-20 sm:py-28 bg-gradient-to-b from-background via-muted/30 to-background"
      aria-labelledby="method-heading"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            The Spark-Agile Method
          </p>
          <h2
            id="method-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Define. Refine. Interact. Verify. Embed.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            A repeatable rhythm that brings intelligence and precision to every transformation, from the first goal to the last retrospective.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <li
                key={stage.key}
                className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-muted-foreground/70">
                    {stage.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{stage.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stage.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
