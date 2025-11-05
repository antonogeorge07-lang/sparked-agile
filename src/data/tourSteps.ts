// Interactive tour steps for different pages

export const dashboardTourSteps = [
  {
    target: "[data-tour='velocity']",
    title: "Track Your Velocity",
    description: "Monitor your team's story points completed per sprint to measure productivity.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='sprint-progress']",
    title: "Sprint Progress",
    description: "See real-time progress towards your sprint goals.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='impediments']",
    title: "Active Impediments",
    description: "Keep track of blockers and resolve them quickly to maintain momentum.",
    position: "left" as const,
  },
  {
    target: "[data-tour='export']",
    title: "Export Reports",
    description: "Generate PowerPoint presentations for stakeholder updates.",
    position: "bottom" as const,
  },
];

export const standupTourSteps = [
  {
    target: "[data-tour='add-update']",
    title: "Daily Updates",
    description: "Share what you did yesterday, what you're doing today, and any blockers.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='ai-summary']",
    title: "AI Summaries",
    description: "Get intelligent summaries and insights from your team's updates.",
    position: "bottom" as const,
  },
];