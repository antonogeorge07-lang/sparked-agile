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
      aggregation_access_limits: {
        Row: {
          access_count: number
          created_at: string
          function_name: string
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          access_count?: number
          created_at?: string
          function_name: string
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          access_count?: number
          created_at?: string
          function_name?: string
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_date: string | null
          export_data: Json | null
          id: string
          request_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_date?: string | null
          export_data?: Json | null
          id?: string
          request_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_date?: string | null
          export_data?: Json | null
          id?: string
          request_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
      epic_closure_reviews: {
        Row: {
          acceptance_criteria_met: boolean | null
          all_features_completed: boolean | null
          checklist_items: Json | null
          closure_date: string | null
          closure_status: string
          created_at: string | null
          created_by: string | null
          documentation_complete: boolean | null
          epic_id: string
          id: string
          review_notes: string | null
          reviewed_by: string | null
          stakeholder_signoff: boolean | null
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria_met?: boolean | null
          all_features_completed?: boolean | null
          checklist_items?: Json | null
          closure_date?: string | null
          closure_status?: string
          created_at?: string | null
          created_by?: string | null
          documentation_complete?: boolean | null
          epic_id: string
          id?: string
          review_notes?: string | null
          reviewed_by?: string | null
          stakeholder_signoff?: boolean | null
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria_met?: boolean | null
          all_features_completed?: boolean | null
          checklist_items?: Json | null
          closure_date?: string | null
          closure_status?: string
          created_at?: string | null
          created_by?: string | null
          documentation_complete?: boolean | null
          epic_id?: string
          id?: string
          review_notes?: string | null
          reviewed_by?: string | null
          stakeholder_signoff?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_closure_reviews_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: true
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_dependencies: {
        Row: {
          created_at: string | null
          created_by: string | null
          dependency_type: string
          depends_on_epic_id: string
          description: string | null
          epic_id: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dependency_type?: string
          depends_on_epic_id: string
          description?: string | null
          epic_id: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dependency_type?: string
          depends_on_epic_id?: string
          description?: string | null
          epic_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "epic_dependencies_depends_on_epic_id_fkey"
            columns: ["depends_on_epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epic_dependencies_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_impact_metrics: {
        Row: {
          baseline_value: number | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          epic_id: string
          id: string
          measurement_date: string | null
          measurement_unit: string | null
          metric_name: string
          metric_type: string
          notes: string | null
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          baseline_value?: number | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          epic_id: string
          id?: string
          measurement_date?: string | null
          measurement_unit?: string | null
          metric_name: string
          metric_type: string
          notes?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          baseline_value?: number | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          epic_id?: string
          id?: string
          measurement_date?: string | null
          measurement_unit?: string | null
          metric_name?: string
          metric_type?: string
          notes?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_impact_metrics_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_milestones: {
        Row: {
          completion_date: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          epic_id: string
          id: string
          status: string
          target_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completion_date?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          epic_id: string
          id?: string
          status?: string
          target_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completion_date?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          epic_id?: string
          id?: string
          status?: string
          target_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_milestones_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_progress_snapshots: {
        Row: {
          completed_features: number
          completed_story_points: number | null
          completion_percentage: number | null
          created_at: string | null
          epic_id: string
          id: string
          snapshot_date: string
          total_features: number
          total_story_points: number | null
          velocity: number | null
        }
        Insert: {
          completed_features?: number
          completed_story_points?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          epic_id: string
          id?: string
          snapshot_date?: string
          total_features?: number
          total_story_points?: number | null
          velocity?: number | null
        }
        Update: {
          completed_features?: number
          completed_story_points?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          epic_id?: string
          id?: string
          snapshot_date?: string
          total_features?: number
          total_story_points?: number | null
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_progress_snapshots_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_roi_tracking: {
        Row: {
          calculation_notes: string | null
          cost_breakdown: Json | null
          created_at: string | null
          created_by: string | null
          epic_id: string
          id: string
          investment_amount: number
          investment_currency: string | null
          last_calculated: string | null
          payback_period_days: number | null
          returns_amount: number | null
          revenue_breakdown: Json | null
          roi_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          calculation_notes?: string | null
          cost_breakdown?: Json | null
          created_at?: string | null
          created_by?: string | null
          epic_id: string
          id?: string
          investment_amount?: number
          investment_currency?: string | null
          last_calculated?: string | null
          payback_period_days?: number | null
          returns_amount?: number | null
          revenue_breakdown?: Json | null
          roi_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          calculation_notes?: string | null
          cost_breakdown?: Json | null
          created_at?: string | null
          created_by?: string | null
          epic_id?: string
          id?: string
          investment_amount?: number
          investment_currency?: string | null
          last_calculated?: string | null
          payback_period_days?: number | null
          returns_amount?: number | null
          revenue_breakdown?: Json | null
          roi_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_roi_tracking_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: true
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_stakeholders: {
        Row: {
          created_at: string | null
          epic_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          epic_id: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          epic_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epic_stakeholders_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
        ]
      }
      epics: {
        Row: {
          acceptance_criteria: string[] | null
          actual_roi: number | null
          business_justification: string | null
          business_value: number | null
          closure_approved: boolean | null
          closure_date: string | null
          color_hex: string | null
          created_at: string | null
          created_by: string | null
          current_velocity: number | null
          description: string | null
          effort_estimate: number | null
          end_date: string | null
          health_score: string | null
          id: string
          last_health_check: string | null
          priority: string | null
          responsible_teams: string[] | null
          roi_score: number | null
          start_date: string | null
          status: string | null
          strategic_goals: string[] | null
          target_velocity: number | null
          title: string
          updated_at: string | null
          value_stream_id: string | null
        }
        Insert: {
          acceptance_criteria?: string[] | null
          actual_roi?: number | null
          business_justification?: string | null
          business_value?: number | null
          closure_approved?: boolean | null
          closure_date?: string | null
          color_hex?: string | null
          created_at?: string | null
          created_by?: string | null
          current_velocity?: number | null
          description?: string | null
          effort_estimate?: number | null
          end_date?: string | null
          health_score?: string | null
          id?: string
          last_health_check?: string | null
          priority?: string | null
          responsible_teams?: string[] | null
          roi_score?: number | null
          start_date?: string | null
          status?: string | null
          strategic_goals?: string[] | null
          target_velocity?: number | null
          title: string
          updated_at?: string | null
          value_stream_id?: string | null
        }
        Update: {
          acceptance_criteria?: string[] | null
          actual_roi?: number | null
          business_justification?: string | null
          business_value?: number | null
          closure_approved?: boolean | null
          closure_date?: string | null
          color_hex?: string | null
          created_at?: string | null
          created_by?: string | null
          current_velocity?: number | null
          description?: string | null
          effort_estimate?: number | null
          end_date?: string | null
          health_score?: string | null
          id?: string
          last_health_check?: string | null
          priority?: string | null
          responsible_teams?: string[] | null
          roi_score?: number | null
          start_date?: string | null
          status?: string | null
          strategic_goals?: string[] | null
          target_velocity?: number | null
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
          display_order: number | null
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
          display_order?: number | null
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
          display_order?: number | null
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
      integration_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          id: string
          integration_type: string
          project_id: string
          updated_at: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data?: Json
          expires_at: string
          id?: string
          integration_type: string
          project_id: string
          updated_at?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          integration_type?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_cache_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          integration_type: string
          payload: Json
          processed_at: string | null
          project_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          integration_type: string
          payload?: Json
          processed_at?: string | null
          project_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          integration_type?: string
          payload?: Json
          processed_at?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_project_id_fkey"
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
        Relationships: [
          {
            foreignKeyName: "integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_feedback: {
        Row: {
          company: string | null
          created_at: string
          feedback: string
          id: string
          is_approved: boolean | null
          name: string
          rating: number | null
          role: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          feedback: string
          id?: string
          is_approved?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          feedback?: string
          id?: string
          is_approved?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
        }
        Relationships: []
      }
      lessons_learned: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          impact: string | null
          project_id: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          impact?: string | null
          project_id: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          impact?: string | null
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_learned_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
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
      onboarding_progress: {
        Row: {
          completed_steps: Json
          created_at: string
          current_step: string | null
          first_epic_id: string | null
          first_project_id: string | null
          first_value_stream_id: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: Json
          created_at?: string
          current_step?: string | null
          first_epic_id?: string | null
          first_project_id?: string | null
          first_value_stream_id?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: Json
          created_at?: string
          current_step?: string | null
          first_epic_id?: string | null
          first_project_id?: string | null
          first_value_stream_id?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pmi_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          target_completion_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          target_completion_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pmi_tasks: {
        Row: {
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          owner: string | null
          position: number
          progress: number | null
          project_id: string
          stage: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          position?: number
          progress?: number | null
          project_id: string
          stage?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          position?: number
          progress?: number | null
          project_id?: string
          stage?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pmi_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
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
      project_budget: {
        Row: {
          budget_allocated: number
          budget_spent: number
          currency: string | null
          id: string
          last_updated: string | null
          project_id: string
        }
        Insert: {
          budget_allocated?: number
          budget_spent?: number
          currency?: string | null
          id?: string
          last_updated?: string | null
          project_id: string
        }
        Update: {
          budget_allocated?: number
          budget_spent?: number
          currency?: string | null
          id?: string
          last_updated?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
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
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_teammates"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          id: string
          project_id: string
          status: string | null
          target_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string | null
          target_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string | null
          target_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_slack_channels: {
        Row: {
          channel_id: string
          channel_name: string | null
          created_at: string
          id: string
          is_active: boolean | null
          notification_types: string[] | null
          project_id: string
          slack_token_id: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          channel_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_types?: string[] | null
          project_id: string
          slack_token_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          channel_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_types?: string[] | null
          project_id?: string
          slack_token_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_slack_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_slack_channels_slack_token_id_fkey"
            columns: ["slack_token_id"]
            isOneToOne: false
            referencedRelation: "user_slack_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          owner: string | null
          position: number
          progress: number | null
          project_id: string
          stage: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          position?: number
          progress?: number | null
          project_id: string
          stage?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          owner?: string | null
          position?: number
          progress?: number | null
          project_id?: string
          stage?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_teammates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_register: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          impact: string | null
          mitigation_strategy: string | null
          owner: string | null
          probability: string | null
          project_id: string
          risk_title: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          mitigation_strategy?: string | null
          owner?: string | null
          probability?: string | null
          project_id: string
          risk_title: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          mitigation_strategy?: string | null
          owner?: string | null
          probability?: string | null
          project_id?: string
          risk_title?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_register_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfaction_surveys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          questions: Json
          survey_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          survey_type: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          survey_type?: string
          title?: string
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          affected_systems: string[] | null
          affected_users: string[] | null
          assigned_bot: boolean | null
          assigned_to: string | null
          bot_status: string | null
          created_at: string
          created_by: string | null
          description: string
          detected_at: string
          detection_method: string | null
          evidence_collected: Json | null
          id: string
          incident_type: string
          lessons_learned: string | null
          resolved_at: string | null
          response_actions: Json | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string[] | null
          affected_users?: string[] | null
          assigned_bot?: boolean | null
          assigned_to?: string | null
          bot_status?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          detected_at?: string
          detection_method?: string | null
          evidence_collected?: Json | null
          id?: string
          incident_type: string
          lessons_learned?: string | null
          resolved_at?: string | null
          response_actions?: Json | null
          root_cause?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string[] | null
          affected_users?: string[] | null
          assigned_bot?: boolean | null
          assigned_to?: string | null
          bot_status?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          detected_at?: string
          detection_method?: string | null
          evidence_collected?: Json | null
          id?: string
          incident_type?: string
          lessons_learned?: string | null
          resolved_at?: string | null
          response_actions?: Json | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sensitive_data_access_log: {
        Row: {
          access_type: string
          created_at: string
          id: string
          ip_address: string | null
          query_context: string | null
          table_accessed: string
          user_id: string
        }
        Insert: {
          access_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          query_context?: string | null
          table_accessed: string
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          query_context?: string | null
          table_accessed?: string
          user_id?: string
        }
        Relationships: []
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
      survey_responses: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          nps_score: number | null
          page: string | null
          rating: number | null
          responses: Json
          survey_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          nps_score?: number | null
          page?: string | null
          rating?: number | null
          responses?: Json
          survey_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          nps_score?: number | null
          page?: string | null
          rating?: number | null
          responses?: Json
          survey_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "satisfaction_surveys"
            referencedColumns: ["id"]
          },
        ]
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
      token_expiry_notifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          integration_type: string
          notification_type: string | null
          notified_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          integration_type: string
          notification_type?: string | null
          notified_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          integration_type?: string
          notification_type?: string | null
          notified_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_consents: {
        Row: {
          analytics_consent: boolean | null
          consent_date: string | null
          functional_consent: boolean | null
          id: string
          ip_address: string | null
          marketing_consent: boolean | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          analytics_consent?: boolean | null
          consent_date?: string | null
          functional_consent?: boolean | null
          id?: string
          ip_address?: string | null
          marketing_consent?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          analytics_consent?: boolean | null
          consent_date?: string | null
          functional_consent?: boolean | null
          id?: string
          ip_address?: string | null
          marketing_consent?: boolean | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          message: string
          metadata: Json | null
          page: string | null
          sentiment: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_type: string
          id?: string
          message: string
          metadata?: Json | null
          page?: string | null
          sentiment?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          page?: string | null
          sentiment?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_github_tokens: {
        Row: {
          created_at: string
          encrypted_token: string | null
          github_token: string
          github_username: string | null
          id: string
          is_valid: boolean | null
          last_validated_at: string | null
          oauth_provider: string | null
          refresh_token: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          validation_error: string | null
        }
        Insert: {
          created_at?: string
          encrypted_token?: string | null
          github_token: string
          github_username?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          validation_error?: string | null
        }
        Update: {
          created_at?: string
          encrypted_token?: string | null
          github_token?: string
          github_username?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          validation_error?: string | null
        }
        Relationships: []
      }
      user_jira_tokens: {
        Row: {
          cloud_id: string | null
          created_at: string
          encrypted_token: string | null
          id: string
          is_valid: boolean | null
          jira_email: string
          jira_site_url: string
          jira_token: string
          last_validated_at: string | null
          oauth_provider: string | null
          refresh_token: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          validation_error: string | null
        }
        Insert: {
          cloud_id?: string | null
          created_at?: string
          encrypted_token?: string | null
          id?: string
          is_valid?: boolean | null
          jira_email: string
          jira_site_url: string
          jira_token: string
          last_validated_at?: string | null
          oauth_provider?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          validation_error?: string | null
        }
        Update: {
          cloud_id?: string | null
          created_at?: string
          encrypted_token?: string | null
          id?: string
          is_valid?: boolean | null
          jira_email?: string
          jira_site_url?: string
          jira_token?: string
          last_validated_at?: string | null
          oauth_provider?: string | null
          refresh_token?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          validation_error?: string | null
        }
        Relationships: []
      }
      user_microsoft_tokens: {
        Row: {
          created_at: string
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          expires_at: string | null
          id: string
          is_valid: boolean | null
          last_validated_at: string | null
          scopes: string[] | null
          updated_at: string
          user_email: string | null
          user_id: string
          validation_error: string | null
        }
        Insert: {
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_email?: string | null
          user_id: string
          validation_error?: string | null
        }
        Update: {
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          scopes?: string[] | null
          updated_at?: string
          user_email?: string | null
          user_id?: string
          validation_error?: string | null
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
      user_slack_tokens: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          created_at: string
          encrypted_access_token: string
          encrypted_bot_token: string | null
          id: string
          is_valid: boolean | null
          last_validated_at: string | null
          scopes: string[] | null
          team_id: string
          team_name: string | null
          updated_at: string
          user_id: string
          validation_error: string | null
          webhook_url: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string
          encrypted_access_token: string
          encrypted_bot_token?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          scopes?: string[] | null
          team_id: string
          team_name?: string | null
          updated_at?: string
          user_id: string
          validation_error?: string | null
          webhook_url?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string
          encrypted_access_token?: string
          encrypted_bot_token?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          scopes?: string[] | null
          team_id?: string
          team_name?: string | null
          updated_at?: string
          user_id?: string
          validation_error?: string | null
          webhook_url?: string | null
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
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          webhook_id: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_id?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          project_id: string | null
          secret: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          project_id?: string | null
          secret?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          project_id?: string | null
          secret?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_project_id_fkey"
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
      workspace_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      ai_usage_logs_sanitized: {
        Row: {
          id: string | null
          model: string | null
          status: string | null
          usage_date: string | null
        }
        Insert: {
          id?: string | null
          model?: never
          status?: string | null
          usage_date?: never
        }
        Update: {
          id?: string | null
          model?: never
          status?: string | null
          usage_date?: never
        }
        Relationships: []
      }
      project_teammates: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      user_subscription_info: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string | null
          status: string | null
          tier_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          status?: string | null
          tier_id?: string | null
          updated_at?: string | null
          user_id?: string | null
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
    }
    Functions: {
      anonymize_deleted_user_data: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      anonymize_old_ai_usage_logs: { Args: never; Returns: number }
      calculate_closure_readiness: {
        Args: { epic_id_param: string }
        Returns: Json
      }
      calculate_epic_health_score: {
        Args: { epic_id_param: string }
        Returns: string
      }
      calculate_epic_progress: {
        Args: { epic_id_param: string }
        Returns: number
      }
      can_access_workspace_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
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
      create_epic_progress_snapshot: {
        Args: { epic_id_param: string }
        Returns: undefined
      }
      get_aggregated_ai_usage_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          period: string
          success_rate: number
          total_requests: number
          unique_users: number
        }[]
      }
      get_ceremony_outlook_status: {
        Args: { ceremony_id: string }
        Returns: boolean
      }
      get_expiring_tokens: {
        Args: { hours_threshold?: number }
        Returns: {
          expires_at: string
          hours_until_expiry: number
          integration_type: string
          user_id: string
        }[]
      }
      get_my_ai_usage_summary: {
        Args: never
        Returns: {
          last_used: string
          monthly_requests: number
          total_requests: number
        }[]
      }
      get_my_ai_usage_trends: {
        Args: never
        Returns: {
          request_count: number
          success_count: number
          usage_week: string
        }[]
      }
      get_my_recent_ai_usage: {
        Args: { limit_count?: number }
        Returns: {
          created_at: string
          id: string
          model: string
          status: string
        }[]
      }
      get_platform_cost_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_cost_per_request: number
          period: string
          total_cost: number
        }[]
      }
      get_platform_stats: {
        Args: never
        Returns: {
          active_users_30d: number
          new_users_7d: number
          total_projects: number
          total_users: number
          total_workspaces: number
        }[]
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
      get_project_teammate_profile: {
        Args: { teammate_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
        }[]
      }
      get_public_user_stats: {
        Args: never
        Returns: {
          recent_signups: number
          total_users: number
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
      get_user_subscription_limits: {
        Args: { user_id_param: string }
        Returns: {
          project_limit: number
          status: string
          team_member_limit: number
          tier_name: string
        }[]
      }
      initialize_epic_closure_review: {
        Args: { epic_id_param: string }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
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
