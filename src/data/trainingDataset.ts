// Auto-generated from Spark-Agile training dataset. Do not edit manually.
// Provides aggregated patterns for AI agent few-shot prompting.

export const trainingDataset = {
  "version": "1.0",
  "source": "Spark-Agile training dataset (synthetic)",
  "generated_at": "2026-05-09T11:14:29.699685Z",
  "projects": [
    {
      "demo_project_id": "11111111-2222-3333-4444-000000000010",
      "name": "Project A",
      "sprint_count": 52,
      "avg_velocity_points": 17.3,
      "velocity_std_dev": 9.9,
      "avg_cycle_time_days": 16.4,
      "p90_cycle_time_days": 31.0,
      "status_distribution": {
        "Done": 206,
        "Backlog": 20,
        "In Progress": 9,
        "Selected for Development": 11,
        "Blocked": 4
      },
      "type_distribution": {
        "Story": 169,
        "Bug": 81
      },
      "priority_distribution": {
        "P3": 112,
        "P2": 66,
        "P1": 24,
        "P4": 48
      },
      "total_issues": 250
    },
    {
      "demo_project_id": "11111111-2222-3333-4444-000000000020",
      "name": "Project B",
      "sprint_count": 51,
      "avg_velocity_points": 15.8,
      "velocity_std_dev": 8.1,
      "avg_cycle_time_days": 17.3,
      "p90_cycle_time_days": 32.0,
      "status_distribution": {
        "Done": 209,
        "Blocked": 8,
        "Selected for Development": 11,
        "Backlog": 18,
        "In Progress": 4
      },
      "type_distribution": {
        "Story": 169,
        "Bug": 81
      },
      "priority_distribution": {
        "P1": 24,
        "P2": 63,
        "P3": 106,
        "P4": 57
      },
      "total_issues": 250
    }
  ]
} as const;

export type TrainingProjectStats = (typeof trainingDataset.projects)[number];
