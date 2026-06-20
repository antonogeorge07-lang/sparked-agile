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

export const sidebarTourSteps = [
  {
    target: "[data-tour='quick-start']",
    title: "Quick Start Guide",
    description: "Start here to learn the platform basics and get up to speed quickly.",
    position: "right" as const,
  },
  {
    target: "[data-tour='dashboard']",
    title: "Dashboard Overview",
    description: "View team velocity, sprint progress, and key metrics at a glance.",
    position: "right" as const,
  },
  {
    target: "[data-tour='epics']",
    title: "Epic Management",
    description: "Manage large initiatives, track dependencies, and monitor epic progress.",
    position: "right" as const,
  },
  {
    target: "[data-tour='command-centre']",
    title: "Command Centre",
    description: "Your project hub for tasks, risks, and lessons learned.",
    position: "right" as const,
  },
  {
    target: "[data-tour='sprint-planning']",
    title: "AI Sprint Planning",
    description: "Get AI-powered sprint recommendations based on team capacity and velocity.",
    position: "right" as const,
  },
  {
    target: "[data-tour='integrations']",
    title: "Integrations",
    description: "Connect with Jira, GitHub, and Microsoft tools to sync your workflow.",
    position: "right" as const,
  },
];