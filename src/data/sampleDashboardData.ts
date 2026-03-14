// Sample data to show value before integrations are connected
export const sampleVelocityData = [
  { sprint: "Sprint 10", points: 32 },
  { sprint: "Sprint 11", points: 38 },
  { sprint: "Sprint 12", points: 35 },
];

export const sampleImpediments = [
  { id: 1, title: "API rate limits affecting deployment", severity: "high", days: 3 },
  { id: 2, title: "Waiting for design assets approval", severity: "medium", days: 5 },
  { id: 3, title: "Cross-browser compatibility issue", severity: "high", days: 2 },
  { id: 4, title: "Database migration pending", severity: "low", days: 7 },
];

export const sampleCurrentVelocity = 35;
export const sampleSprintProgress = 68;
export const sampleDaysRemaining = 8;

export const sampleInsights = [
  {
    title: "🚀 Velocity Trend",
    description: "Team velocity has improved by 12% over the last 3 sprints, indicating better estimation and productivity.",
    category: "performance"
  },
  {
    title: "⚠️ High Priority Blockers",
    description: "2 high-severity impediments detected. Consider addressing these in the next standup to maintain momentum.",
    category: "blockers"
  },
  {
    title: "📊 Sprint Health",
    description: "Sprint is 68% complete with 8 days remaining. On track to meet sprint goals based on current burn-down rate.",
    category: "progress"
  },
  {
    title: "👥 Team Collaboration",
    description: "3 team members actively collaborating. Strong engagement across the platform.",
    category: "collaboration"
  }
];

export const sampleRecentActivity = [
  { title: "Sprint 12 Started", description: "Team began work on new sprint objectives", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { title: "Daily Standup Completed", description: "Team sync meeting finished with 5 participants", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { title: "Action Items Created", description: "3 new action items from retrospective", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { title: "Integration Connected", description: "GitHub successfully connected to project", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

// Sample workflow execution data for charts
export const sampleWorkflowData = [
  { date: "Mon", standup: 3, sprint: 1, retro: 0 },
  { date: "Tue", standup: 4, sprint: 0, retro: 1 },
  { date: "Wed", standup: 3, sprint: 2, retro: 0 },
  { date: "Thu", standup: 5, sprint: 1, retro: 0 },
  { date: "Fri", standup: 4, sprint: 0, retro: 2 },
  { date: "Sat", standup: 1, sprint: 0, retro: 0 },
  { date: "Sun", standup: 0, sprint: 0, retro: 0 },
];

// Sample action items data for charts
export const sampleActionItemsData = [
  { priority: "Critical", completed: 8, pending: 2 },
  { priority: "High", completed: 15, pending: 5 },
  { priority: "Medium", completed: 22, pending: 8 },
  { priority: "Low", completed: 12, pending: 3 },
];