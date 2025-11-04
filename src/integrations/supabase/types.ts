export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agile_release_trains: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          value_stream_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          value_stream_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          value_stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agile_release_trains_value_stream_id_fkey"
            columns: ["value_stream_id"]
            isOneToOne: false
            referencedRelation: "value_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          model: string
          project_id: string | null
          status: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          model: string
          project_id?: string | null
          status?: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          model?: string
          project_id?: string | null
          status?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      ceremony_configs: {
        Row: {
          attendees: string[] | null
          ceremony_type: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          outlook_event_id: string | null
          recurrence_pattern: string | null
          start_time: string | null
          workspace_id: string
        }
        Insert: {
          attendees?: string[] | null
          ceremony_type: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          outlook_event_id?: string | null
          recurrence_pattern?: string | null
          start_time?: string | null
          workspace_id: string
        }
        Update: {
          attendees?: string[] | null
          ceremony_type?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          outlook_event_id?: string | null
          recurrence_pattern?: string | null
          start_time?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "project_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ceremony_reminders: {
        Row: {
          ceremony_type: string
          created_at: string
          id: string
          project_id: string
          reminder_message: string | null
          scheduled_time: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ceremony_type: string
          created_at?: string
          id?: string
          project_id: string
          reminder_message?: string | null
          scheduled_time: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ceremony_type?: string
          created_at?: string
          id?: string
          project_id?: string
          reminder_message?: string | null
          scheduled_time?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ceremony_reminders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dependencies: {
        Row: {
          created_at: string | null
          dependent_feature_id: string | null
          id: string
          notes: string | null
          source_feature_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          dependent_feature_id?: string | null
          id?: string
          notes?: string | null
          source_feature_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          dependent_feature_id?: string | null
          id?: string
          notes?: string | null
          source_feature_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dependencies_dependent_feature_id_fkey"
            columns: ["dependent_feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dependencies_source_feature_id_fkey"
            columns: ["source_feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      epics: {
        Row: {
          business_value: number | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          value_stream_id: string | null
        }
        Insert: {
          business_value?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          value_stream_id?: string | null
        }
        Update: {
          business_value?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          value_stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epics_value_stream_id_fkey"
            columns: ["value_stream_id"]
            isOneToOne: false
            referencedRelation: "value_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string | null
          description: string | null
          effort_estimate: number | null
          epic_id: string | null
          id: string
          pi_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effort_estimate?: number | null
          epic_id?: string | null
          id?: string
          pi_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effort_estimate?: number | null
          epic_id?: string | null
          id?: string
          pi_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "features_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "features_pi_id_fkey"
            columns: ["pi_id"]
            isOneToOne: false
            referencedRelation: "program_increments"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_metrics: {
        Row: {
          created_at: string | null
          cycle_time_avg: number | null
          id: string
          lead_time_avg: number | null
          metric_date: string
          project_id: string | null
          throughput: number | null
          work_in_progress: number | null
        }
        Insert: {
          created_at?: string | null
          cycle_time_avg?: number | null
          id?: string
          lead_time_avg?: number | null
          metric_date: string
          project_id?: string | null
          throughput?: number | null
          work_in_progress?: number | null
        }
        Update: {
          created_at?: string | null
          cycle_time_avg?: number | null
          id?: string
          lead_time_avg?: number | null
          metric_date?: string
          project_id?: string | null
          throughput?: number | null
          work_in_progress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      okrs: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          id: string
          pi_id: string | null
          status: string | null
          target_value: number | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          pi_id?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          id?: string
          pi_id?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okrs_pi_id_fkey"
            columns: ["pi_id"]
            isOneToOne: false
            referencedRelation: "program_increments"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_access_log: {
        Row: {
          accessed_at: string | null
          accessed_profile_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          accessed_profile_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          accessed_profile_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          preferences: Json | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          preferences?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program_increments: {
        Row: {
          art_id: string | null
          created_at: string | null
          end_date: string
          id: string
          name: string
          objectives: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          art_id?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          objectives?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          art_id?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          objectives?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_increments_art_id_fkey"
            columns: ["art_id"]
            isOneToOne: false
            referencedRelation: "agile_release_trains"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_usage_stats: {
        Row: {
          active_users: number
          ai_calls: number
          created_at: string
          date: string
          id: string
          project_id: string
          tokens_used: number
          total_actions: number
          updated_at: string
        }
        Insert: {
          active_users?: number
          ai_calls?: number
          created_at?: string
          date: string
          id?: string
          project_id: string
          tokens_used?: number
          total_actions?: number
          updated_at?: string
        }
        Update: {
          active_users?: number
          ai_calls?: number
          created_at?: string
          date?: string
          id?: string
          project_id?: string
          tokens_used?: number
          total_actions?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_workspaces: {
        Row: {
          configuration_status: string | null
          created_at: string | null
          github_repo_name: string | null
          github_repo_url: string | null
          id: string
          jira_board_id: string | null
          jira_board_url: string | null
          name: string
          outlook_calendar_id: string | null
          project_id: string
          team_distribution_list: string | null
          teams_channel_id: string | null
          updated_at: string | null
        }
        Insert: {
          configuration_status?: string | null
          created_at?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          id?: string
          jira_board_id?: string | null
          jira_board_url?: string | null
          name: string
          outlook_calendar_id?: string | null
          project_id: string
          team_distribution_list?: string | null
          teams_channel_id?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration_status?: string | null
          created_at?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          id?: string
          jira_board_id?: string | null
          jira_board_url?: string | null
          name?: string
          outlook_calendar_id?: string | null
          project_id?: string
          team_distribution_list?: string | null
          teams_channel_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_planning_sessions: {
        Row: {
          agenda: string | null
          backlog_items: Json | null
          created_at: string | null
          created_by: string | null
          discussion_topics: string[] | null
          id: string
          meeting_minutes: string | null
          outlook_event_id: string | null
          project_id: string
          sprint_goal: string | null
          sprint_number: number
          status: string | null
          story_points_estimate: number | null
          updated_at: string | null
          velocity_data: Json | null
          workspace_id: string | null
        }
        Insert: {
          agenda?: string | null
          backlog_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          discussion_topics?: string[] | null
          id?: string
          meeting_minutes?: string | null
          outlook_event_id?: string | null
          project_id: string
          sprint_goal?: string | null
          sprint_number: number
          status?: string | null
          story_points_estimate?: number | null
          updated_at?: string | null
          velocity_data?: Json | null
          workspace_id?: string | null
        }
        Update: {
          agenda?: string | null
          backlog_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          discussion_topics?: string[] | null
          id?: string
          meeting_minutes?: string | null
          outlook_event_id?: string | null
          project_id?: string
          sprint_goal?: string | null
          sprint_number?: number
          status?: string | null
          story_points_estimate?: number | null
          updated_at?: string | null
          velocity_data?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "project_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_review_sessions: {
        Row: {
          achieved_objectives: string | null
          backlog_updates: string | null
          completed_tickets: Json | null
          created_at: string | null
          created_by: string | null
          delivered_features: string[] | null
          demo_checklist: string[] | null
          github_commits: Json | null
          id: string
          meeting_date: string | null
          outlook_event_id: string | null
          project_id: string
          sprint_number: number
          stakeholder_feedback: string | null
          status: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          achieved_objectives?: string | null
          backlog_updates?: string | null
          completed_tickets?: Json | null
          created_at?: string | null
          created_by?: string | null
          delivered_features?: string[] | null
          demo_checklist?: string[] | null
          github_commits?: Json | null
          id?: string
          meeting_date?: string | null
          outlook_event_id?: string | null
          project_id: string
          sprint_number: number
          stakeholder_feedback?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          achieved_objectives?: string | null
          backlog_updates?: string | null
          completed_tickets?: Json | null
          created_at?: string | null
          created_by?: string | null
          delivered_features?: string[] | null
          demo_checklist?: string[] | null
          github_commits?: Json | null
          id?: string
          meeting_date?: string | null
          outlook_event_id?: string | null
          project_id?: string
          sprint_number?: number
          stakeholder_feedback?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "project_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_summaries: {
        Row: {
          action_items_generated: number | null
          ai_insights: string | null
          blockers_identified: string[] | null
          created_at: string
          id: string
          key_achievements: string[] | null
          project_id: string | null
          sprint_number: number | null
          summary: string
        }
        Insert: {
          action_items_generated?: number | null
          ai_insights?: string | null
          blockers_identified?: string[] | null
          created_at?: string
          id?: string
          key_achievements?: string[] | null
          project_id?: string | null
          sprint_number?: number | null
          summary: string
        }
        Update: {
          action_items_generated?: number | null
          ai_insights?: string | null
          blockers_identified?: string[] | null
          created_at?: string
          id?: string
          key_achievements?: string[] | null
          project_id?: string | null
          sprint_number?: number | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      standup_updates: {
        Row: {
          blockers: string | null
          created_at: string
          id: string
          project_id: string | null
          team_member_id: string | null
          today: string
          yesterday: string
        }
        Insert: {
          blockers?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          team_member_id?: string | null
          today: string
          yesterday: string
        }
        Update: {
          blockers?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          team_member_id?: string | null
          today?: string
          yesterday?: string
        }
        Relationships: [
          {
            foreignKeyName: "standup_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standup_updates_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number | null
          price_yearly: number | null
          project_limit: number
          stripe_price_id: string | null
          team_member_limit: number
          updated_at: string
          workspace_limit: number
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          project_limit?: number
          stripe_price_id?: string | null
          team_member_limit: number
          updated_at?: string
          workspace_limit: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          project_limit?: number
          stripe_price_id?: string | null
          team_member_limit?: number
          updated_at?: string
          workspace_limit?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          project_id: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          project_id?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          project_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          page: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      value_streams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "value_streams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          project_id: string | null
          status: string | null
          workflow_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          project_id?: string | null
          status?: string | null
          workflow_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          project_id?: string | null
          status?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: { Args: { user_id_param: string }; Returns: undefined }
      can_create_project: { Args: { user_id_param: string }; Returns: boolean }
      check_integration_status: {
        Args: { integration_id: string }
        Returns: {
          id: string
          integration_type: string
          is_active: boolean
          last_tested: string
        }[]
      }
      check_user_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Returns: boolean
      }
      get_project_limit_info: {
        Args: { user_id_param: string }
        Returns: {
          can_create: boolean
          current_count: number
          limit_count: number
          tier_name: string
        }[]
      }
      get_safe_integration_info: {
        Args: { integration_id: string }
        Returns: {
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          project_id: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_approved_user: { Args: { user_id: string }; Returns: boolean }
      is_pending_user: { Args: { user_id: string }; Returns: boolean }
      toggle_integration_status: {
        Args: { integration_id: string; new_status: boolean }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member", "pending"],
    },
  },
} as const
