// Sample data for all analytics pages when no real data exists

export const sampleBacklogItems = [
  {
    key: "PROJ-101",
    summary: "Implement user authentication flow",
    status: "In Progress",
    priority: "High",
    age_days: 5,
    has_description: true,
    has_acceptance_criteria: true,
    needs_po_attention: false,
    recommendation: null,
  },
  {
    key: "PROJ-102",
    summary: "Design dashboard analytics view",
    status: "To Do",
    priority: "Medium",
    age_days: 12,
    has_description: true,
    has_acceptance_criteria: false,
    needs_po_attention: true,
    recommendation: "Add acceptance criteria before sprint planning",
  },
  {
    key: "PROJ-103",
    summary: "API rate limiting middleware",
    status: "To Do",
    priority: "High",
    age_days: 45,
    has_description: false,
    has_acceptance_criteria: false,
    needs_po_attention: true,
    recommendation: "Stale item - consider grooming or removing",
  },
  {
    key: "PROJ-104",
    summary: "Mobile responsive navigation",
    status: "Done",
    priority: "Medium",
    age_days: 3,
    has_description: true,
    has_acceptance_criteria: true,
    needs_po_attention: false,
    recommendation: null,
  },
  {
    key: "PROJ-105",
    summary: "Database migration for multi-tenancy",
    status: "To Do",
    priority: "Highest",
    age_days: 8,
    has_description: true,
    has_acceptance_criteria: true,
    dependencies: ["PROJ-101"],
    needs_po_attention: false,
    recommendation: null,
  },
];

export const sampleBacklogAnalysis = {
  total_items: 24,
  stale_items: 3,
  unclear_items: 5,
  items_with_dependencies: 4,
  velocity_trend: "Team velocity has increased by 15% over the last 3 sprints, averaging 38 story points per sprint.",
  recommendations: [
    "3 items are older than 30 days - consider grooming or archiving stale backlog items",
    "5 items lack acceptance criteria - prioritise refinement before next sprint planning",
    "Strong velocity trend suggests the team can take on 2-3 additional story points next sprint",
    "Consider breaking down PROJ-105 (database migration) into smaller, independently deliverable tasks",
  ],
  items: sampleBacklogItems,
};

export const sampleAIUsageStats = [
  { id: "1", created_at: new Date(Date.now() - 1 * 86400000).toISOString(), model: "gemini-2.5-flash", status: "success", endpoint: "generate-standup-summary" },
  { id: "2", created_at: new Date(Date.now() - 1 * 86400000).toISOString(), model: "gemini-2.5-flash", status: "success", endpoint: "generate-retro-insights" },
  { id: "3", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), model: "gemini-2.5-pro", status: "success", endpoint: "ai-copilot" },
  { id: "4", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), model: "gemini-2.5-flash", status: "error", endpoint: "analyze-backlog-health", error_message: "Integration not configured" },
  { id: "5", created_at: new Date(Date.now() - 3 * 86400000).toISOString(), model: "gemini-2.5-pro", status: "success", endpoint: "generate-sprint-plan" },
  { id: "6", created_at: new Date(Date.now() - 3 * 86400000).toISOString(), model: "gemini-2.5-flash", status: "success", endpoint: "generate-test-scenarios" },
  { id: "7", created_at: new Date(Date.now() - 4 * 86400000).toISOString(), model: "gpt-4o-mini", status: "success", endpoint: "process-meeting-notes" },
  { id: "8", created_at: new Date(Date.now() - 5 * 86400000).toISOString(), model: "gemini-2.5-flash", status: "success", endpoint: "generate-smart-nudges" },
  { id: "9", created_at: new Date(Date.now() - 5 * 86400000).toISOString(), model: "gemini-2.5-pro", status: "success", endpoint: "agent-debate" },
  { id: "10", created_at: new Date(Date.now() - 6 * 86400000).toISOString(), model: "gemini-2.5-flash", status: "success", endpoint: "generate-standup-summary" },
];

export const sampleActivityStats = [
  { id: "1", user_id: "user-1", action: "page_view", page: "/dashboard", created_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "2", user_id: "user-1", action: "standup_completed", page: "/standup", created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "3", user_id: "user-2", action: "page_view", page: "/backlog-refinement", created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "4", user_id: "user-1", action: "task_created", page: "/project-command-centre", created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "5", user_id: "user-3", action: "sprint_started", page: "/sprint-planning-assistant", created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "6", user_id: "user-2", action: "retro_completed", page: "/retrospective", created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: "7", user_id: "user-1", action: "page_view", page: "/epic-management", created_at: new Date(Date.now() - 7 * 3600000).toISOString() },
  { id: "8", user_id: "user-3", action: "page_view", page: "/dashboard", created_at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: "9", user_id: "user-2", action: "integration_connected", page: "/integrations", created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: "10", user_id: "user-1", action: "epic_created", page: "/epic-management", created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
];

export const sampleJiraIssues = [
  { key: "SPRINT-42", summary: "User login with SSO", status: "In Progress", priority: "High", assignee: "Alice", updated: new Date(Date.now() - 2 * 3600000).toISOString() },
  { key: "SPRINT-43", summary: "Dashboard performance optimisation", status: "To Do", priority: "Medium", assignee: "Bob", updated: new Date(Date.now() - 5 * 3600000).toISOString() },
  { key: "SPRINT-44", summary: "API error handling improvements", status: "Done", priority: "High", assignee: "Charlie", updated: new Date(Date.now() - 8 * 3600000).toISOString() },
  { key: "SPRINT-45", summary: "Email notification templates", status: "In Review", priority: "Low", assignee: "Alice", updated: new Date(Date.now() - 12 * 3600000).toISOString() },
  { key: "SPRINT-46", summary: "Mobile responsive epic timeline", status: "To Do", priority: "Medium", assignee: "Bob", updated: new Date(Date.now() - 24 * 3600000).toISOString() },
];

export const sampleProjectStats = {
  totalActionItems: 12,
  openActionItems: 4,
  latestMetrics: {
    cycle_time_avg: 3.2,
    lead_time_avg: 5.1,
    work_in_progress: 8,
    throughput: 12,
  },
  valueStreams: [
    { id: "vs-1", name: "Customer Onboarding", epics: [{ count: 3 }] },
    { id: "vs-2", name: "Platform Scalability", epics: [{ count: 2 }] },
  ],
};
