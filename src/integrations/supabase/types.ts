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
            foreignKeyName: "action_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      agent_consensus_votes: {
        Row: {
          agent_name: string
          conditions: string | null
          created_at: string
          id: string
          session_id: string
          vote: string
          weight: number
        }
        Insert: {
          agent_name: string
          conditions?: string | null
          created_at?: string
          id?: string
          session_id: string
          vote: string
          weight?: number
        }
        Update: {
          agent_name?: string
          conditions?: string | null
          created_at?: string
          id?: string
          session_id?: string
          vote?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_consensus_votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_debate_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_debate_responses: {
        Row: {
          agent_name: string
          agent_role: string
          agrees_with: Json | null
          confidence_score: number | null
          content: string
          created_at: string
          disagrees_with: Json | null
          id: string
          metadata: Json | null
          reasoning: string | null
          response_type: string
          round_number: number
          session_id: string
        }
        Insert: {
          agent_name: string
          agent_role: string
          agrees_with?: Json | null
          confidence_score?: number | null
          content: string
          created_at?: string
          disagrees_with?: Json | null
          id?: string
          metadata?: Json | null
          reasoning?: string | null
          response_type: string
          round_number?: number
          session_id: string
        }
        Update: {
          agent_name?: string
          agent_role?: string
          agrees_with?: Json | null
          confidence_score?: number | null
          content?: string
          created_at?: string
          disagrees_with?: Json | null
          id?: string
          metadata?: Json | null
          reasoning?: string | null
          response_type?: string
          round_number?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_debate_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "agent_debate_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_debate_sessions: {
        Row: {
          completed_at: string | null
          consensus_confidence: number | null
          consensus_result: Json | null
          context: Json | null
          created_at: string
          final_recommendation: string | null
          id: string
          initiated_by: string
          project_id: string | null
          status: string
          topic: string
          topic_type: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          consensus_confidence?: number | null
          consensus_result?: Json | null
          context?: Json | null
          created_at?: string
          final_recommendation?: string | null
          id?: string
          initiated_by: string
          project_id?: string | null
          status?: string
          topic: string
          topic_type: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          consensus_confidence?: number | null
          consensus_result?: Json | null
          context?: Json | null
          created_at?: string
          final_recommendation?: string | null
          id?: string
          initiated_by?: string
          project_id?: string | null
          status?: string
          topic?: string
          topic_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_debate_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
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
      ai_suggestions: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string
          id: string
          item_id: string | null
          metadata: Json | null
          project_id: string
          sprint_id: string | null
          status: string
          suggestion_type: string
          title: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          project_id: string
          sprint_id?: string | null
          status?: string
          suggestion_type: string
          title: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string
          id?: string
          item_id?: string | null
          metadata?: Json | null
          project_id?: string
          sprint_id?: string | null
          status?: string
          suggestion_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "native_backlog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "native_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_test_scenarios: {
        Row: {
          acceptance_criteria: string | null
          backlog_item_id: string | null
          created_at: string
          generated_by: string
          generated_scenarios: Json
          id: string
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          scenario_count: number
          status: string
          updated_at: string
          user_story: string
        }
        Insert: {
          acceptance_criteria?: string | null
          backlog_item_id?: string | null
          created_at?: string
          generated_by: string
          generated_scenarios?: Json
          id?: string
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scenario_count?: number
          status?: string
          updated_at?: string
          user_story: string
        }
        Update: {
          acceptance_criteria?: string | null
          backlog_item_id?: string | null
          created_at?: string
          generated_by?: string
          generated_scenarios?: Json
          id?: string
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scenario_count?: number
          status?: string
          updated_at?: string
          user_story?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_test_scenarios_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "native_backlog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_test_scenarios_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
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
      approval_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string | null
          current_value: Json | null
          description: string | null
          due_date: string | null
          email_sent_at: string | null
          epic_id: string | null
          id: string
          priority: string | null
          project_id: string | null
          proposed_value: Json | null
          rejected_at: string | null
          rejection_reason: string | null
          request_type: string
          requester_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string | null
          current_value?: Json | null
          description?: string | null
          due_date?: string | null
          email_sent_at?: string | null
          epic_id?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          proposed_value?: Json | null
          rejected_at?: string | null
          rejection_reason?: string | null
          request_type: string
          requester_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string | null
          current_value?: Json | null
          description?: string | null
          due_date?: string | null
          email_sent_at?: string | null
          epic_id?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          proposed_value?: Json | null
          rejected_at?: string | null
          rejection_reason?: string | null
          request_type?: string
          requester_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      board_columns: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_done_column: boolean | null
          name: string
          position: number
          project_id: string
          wip_limit: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_done_column?: boolean | null
          name: string
          position?: number
          project_id: string
          wip_limit?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_done_column?: boolean | null
          name?: string
          position?: number
          project_id?: string
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "board_columns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["workspace_id_legacy"]
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
          {
            foreignKeyName: "ceremony_reminders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
      data_breach_access_audit: {
        Row: {
          access_granted: boolean
          accessed_at: string
          action: string
          breach_id: string | null
          id: string
          ip_address_hash: string | null
          record_hash: string
          user_agent: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          access_granted?: boolean
          accessed_at?: string
          action: string
          breach_id?: string | null
          id?: string
          ip_address_hash?: string | null
          record_hash: string
          user_agent?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          access_granted?: boolean
          accessed_at?: string
          action?: string
          breach_id?: string | null
          id?: string
          ip_address_hash?: string | null
          record_hash?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_breach_log: {
        Row: {
          affected_data_types: string[] | null
          affected_user_count: number | null
          breach_type: string
          containment_actions: string[] | null
          created_by: string | null
          description: string | null
          detected_at: string | null
          id: string
          notification_sent_at: string | null
          resolved_at: string | null
          severity: string | null
          supervisory_authority_notified: boolean | null
        }
        Insert: {
          affected_data_types?: string[] | null
          affected_user_count?: number | null
          breach_type: string
          containment_actions?: string[] | null
          created_by?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          notification_sent_at?: string | null
          resolved_at?: string | null
          severity?: string | null
          supervisory_authority_notified?: boolean | null
        }
        Update: {
          affected_data_types?: string[] | null
          affected_user_count?: number | null
          breach_type?: string
          containment_actions?: string[] | null
          created_by?: string | null
          description?: string | null
          detected_at?: string | null
          id?: string
          notification_sent_at?: string | null
          resolved_at?: string | null
          severity?: string | null
          supervisory_authority_notified?: boolean | null
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
      digest_history: {
        Row: {
          ai_summary: string | null
          delivery_status: string | null
          digest_content: Json
          id: string
          project_id: string | null
          sent_at: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          delivery_status?: string | null
          digest_content: Json
          id?: string
          project_id?: string | null
          sent_at?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          delivery_status?: string | null
          digest_content?: Json
          id?: string
          project_id?: string | null
          sent_at?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digest_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digest_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "digest_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "digest_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      digest_subscriptions: {
        Row: {
          created_at: string | null
          delivery_day: number | null
          delivery_hour: number | null
          digest_type: string
          email_address: string | null
          id: string
          include_metrics: boolean | null
          include_recommendations: boolean | null
          include_risks: boolean | null
          include_wins: boolean | null
          is_active: boolean | null
          last_sent_at: string | null
          project_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_day?: number | null
          delivery_hour?: number | null
          digest_type?: string
          email_address?: string | null
          id?: string
          include_metrics?: boolean | null
          include_recommendations?: boolean | null
          include_risks?: boolean | null
          include_wins?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivery_day?: number | null
          delivery_hour?: number | null
          digest_type?: string
          email_address?: string | null
          id?: string
          include_metrics?: boolean | null
          include_recommendations?: boolean | null
          include_risks?: boolean | null
          include_wins?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digest_subscriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digest_subscriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
      epic_readiness_checks: {
        Row: {
          check_name: string
          check_type: string
          checked_at: string | null
          checked_by: string | null
          created_at: string
          epic_id: string
          id: string
          is_passed: boolean | null
          notes: string | null
          updated_at: string
          validation_run_id: string | null
        }
        Insert: {
          check_name: string
          check_type: string
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          epic_id: string
          id?: string
          is_passed?: boolean | null
          notes?: string | null
          updated_at?: string
          validation_run_id?: string | null
        }
        Update: {
          check_name?: string
          check_type?: string
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string
          epic_id?: string
          id?: string
          is_passed?: boolean | null
          notes?: string | null
          updated_at?: string
          validation_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_readiness_checks_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epic_readiness_checks_validation_run_id_fkey"
            columns: ["validation_run_id"]
            isOneToOne: false
            referencedRelation: "epic_validation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_recalibration_log: {
        Row: {
          action_type: string
          created_at: string
          description: string
          epic_id: string
          id: string
          new_value: Json | null
          old_value: Json | null
          performed_by: string
          target_feature_id: string | null
          validation_run_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          epic_id: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_by: string
          target_feature_id?: string | null
          validation_run_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          epic_id?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string
          target_feature_id?: string | null
          validation_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epic_recalibration_log_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epic_recalibration_log_target_feature_id_fkey"
            columns: ["target_feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epic_recalibration_log_validation_run_id_fkey"
            columns: ["validation_run_id"]
            isOneToOne: false
            referencedRelation: "epic_validation_runs"
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
      epic_validation_items: {
        Row: {
          ai_decision: string
          ai_reasoning: string | null
          ai_recommendation: string | null
          created_at: string
          current_status: string | null
          decided_at: string | null
          decided_by: string | null
          feature_id: string | null
          final_decision: string | null
          id: string
          item_name: string
          stakeholder_notes: string | null
          validation_run_id: string
        }
        Insert: {
          ai_decision: string
          ai_reasoning?: string | null
          ai_recommendation?: string | null
          created_at?: string
          current_status?: string | null
          decided_at?: string | null
          decided_by?: string | null
          feature_id?: string | null
          final_decision?: string | null
          id?: string
          item_name: string
          stakeholder_notes?: string | null
          validation_run_id: string
        }
        Update: {
          ai_decision?: string
          ai_reasoning?: string | null
          ai_recommendation?: string | null
          created_at?: string
          current_status?: string | null
          decided_at?: string | null
          decided_by?: string | null
          feature_id?: string | null
          final_decision?: string | null
          id?: string
          item_name?: string
          stakeholder_notes?: string | null
          validation_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epic_validation_items_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epic_validation_items_validation_run_id_fkey"
            columns: ["validation_run_id"]
            isOneToOne: false
            referencedRelation: "epic_validation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      epic_validation_runs: {
        Row: {
          ai_summary: string | null
          created_at: string
          delivery_alignment_check: string | null
          dependencies_checked: number | null
          effort_analysis: Json | null
          epic_id: string
          features_analysed: number | null
          id: string
          metadata: Json | null
          next_steps: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          run_by: string
          status: string
          updated_at: string
          verdict_alignment: string | null
          verdict_summary: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          delivery_alignment_check?: string | null
          dependencies_checked?: number | null
          effort_analysis?: Json | null
          epic_id: string
          features_analysed?: number | null
          id?: string
          metadata?: Json | null
          next_steps?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_by: string
          status?: string
          updated_at?: string
          verdict_alignment?: string | null
          verdict_summary?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          delivery_alignment_check?: string | null
          dependencies_checked?: number | null
          effort_analysis?: Json | null
          epic_id?: string
          features_analysed?: number | null
          id?: string
          metadata?: Json | null
          next_steps?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          run_by?: string
          status?: string
          updated_at?: string
          verdict_alignment?: string | null
          verdict_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epic_validation_runs_epic_id_fkey"
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
          validation_notes: string | null
          validation_status: string | null
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
          validation_notes?: string | null
          validation_status?: string | null
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
          validation_notes?: string | null
          validation_status?: string | null
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
          {
            foreignKeyName: "flow_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      gdpr_consent_history: {
        Row: {
          action: string
          consent_given: boolean
          consent_record_id: string
          consent_text: string | null
          consent_type: string
          id: string
          ip_address_hash: string | null
          previous_value: boolean | null
          record_hash: string
          recorded_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          consent_given: boolean
          consent_record_id: string
          consent_text?: string | null
          consent_type: string
          id?: string
          ip_address_hash?: string | null
          previous_value?: boolean | null
          record_hash: string
          recorded_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          consent_given?: boolean
          consent_record_id?: string
          consent_text?: string | null
          consent_type?: string
          id?: string
          ip_address_hash?: string | null
          previous_value?: boolean | null
          record_hash?: string
          recorded_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gdpr_consent_records: {
        Row: {
          consent_given: boolean
          consent_text: string | null
          consent_type: string
          created_at: string | null
          id: string
          integrity_hash: string | null
          ip_address: string | null
          user_agent: string | null
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_given: boolean
          consent_text?: string | null
          consent_type: string
          created_at?: string | null
          id?: string
          integrity_hash?: string | null
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_text?: string | null
          consent_type?: string
          created_at?: string | null
          id?: string
          integrity_hash?: string | null
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "integration_cache_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
          {
            foreignKeyName: "integration_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
          {
            foreignKeyName: "integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      item_activity_log: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string
          id: string
          item_id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string
          id?: string
          item_id: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          item_id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_activity_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "native_backlog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          item_id: string
          mime_type: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          item_id: string
          mime_type?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          item_id?: string
          mime_type?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "native_backlog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_ai_generated: boolean | null
          item_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          item_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          item_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "native_backlog_items"
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
      meeting_notes: {
        Row: {
          ai_summary: string | null
          attendees: string[] | null
          created_at: string
          created_by: string
          extracted_action_items: Json | null
          extracted_decisions: Json | null
          extracted_key_topics: Json | null
          id: string
          meeting_date: string
          meeting_type: string
          processed_at: string | null
          project_id: string
          raw_notes: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          attendees?: string[] | null
          created_at?: string
          created_by: string
          extracted_action_items?: Json | null
          extracted_decisions?: Json | null
          extracted_key_topics?: Json | null
          id?: string
          meeting_date?: string
          meeting_type?: string
          processed_at?: string | null
          project_id: string
          raw_notes: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          attendees?: string[] | null
          created_at?: string
          created_by?: string
          extracted_action_items?: Json | null
          extracted_decisions?: Json | null
          extracted_key_topics?: Json | null
          id?: string
          meeting_date?: string
          meeting_type?: string
          processed_at?: string | null
          project_id?: string
          raw_notes?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      native_backlog_items: {
        Row: {
          acceptance_criteria: string[] | null
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          epic_id: string | null
          id: string
          item_type: string
          labels: string[] | null
          parent_id: string | null
          position: number
          priority: string
          project_id: string
          reporter_id: string | null
          sprint_id: string | null
          status: string
          story_points: number | null
          title: string
          updated_at: string
        }
        Insert: {
          acceptance_criteria?: string[] | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          id?: string
          item_type?: string
          labels?: string[] | null
          parent_id?: string | null
          position?: number
          priority?: string
          project_id: string
          reporter_id?: string | null
          sprint_id?: string | null
          status?: string
          story_points?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          acceptance_criteria?: string[] | null
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          id?: string
          item_type?: string
          labels?: string[] | null
          parent_id?: string | null
          position?: number
          priority?: string
          project_id?: string
          reporter_id?: string | null
          sprint_id?: string | null
          status?: string
          story_points?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "native_backlog_items_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "native_backlog_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "native_backlog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "native_backlog_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "native_backlog_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "native_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      native_sprints: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          goal: string | null
          id: string
          name: string
          project_id: string
          start_date: string
          status: string
          updated_at: string
          velocity_committed: number | null
          velocity_completed: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          goal?: string | null
          id?: string
          name: string
          project_id: string
          start_date: string
          status?: string
          updated_at?: string
          velocity_committed?: number | null
          velocity_completed?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          goal?: string | null
          id?: string
          name?: string
          project_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          velocity_committed?: number | null
          velocity_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "native_sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
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
          anonymized: boolean | null
          avatar_url: string | null
          consent_timestamp: string | null
          created_at: string | null
          data_retention_consent: boolean | null
          deletion_requested_at: string | null
          email: string
          full_name: string | null
          id: string
          last_activity_at: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          anonymized?: boolean | null
          avatar_url?: string | null
          consent_timestamp?: string | null
          created_at?: string | null
          data_retention_consent?: boolean | null
          deletion_requested_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_activity_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          anonymized?: boolean | null
          avatar_url?: string | null
          consent_timestamp?: string | null
          created_at?: string | null
          data_retention_consent?: boolean | null
          deletion_requested_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_activity_at?: string | null
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
      project_knowledge_base: {
        Row: {
          content: string
          content_type: string
          created_at: string
          created_by: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          project_id: string
          search_vector: unknown
          source_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          project_id: string
          search_vector?: unknown
          source_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string
          search_vector?: unknown
          source_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_knowledge_base_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_knowledge_base_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_member_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          id: string
          ip_address: string | null
          members_accessed: number
          project_id: string
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          id?: string
          ip_address?: string | null
          members_accessed?: number
          project_id: string
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          id?: string
          ip_address?: string | null
          members_accessed?: number
          project_id?: string
          user_id?: string
        }
        Relationships: []
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
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_teammate_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_teammates_safe"
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
            foreignKeyName: "project_slack_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_slack_channels_slack_token_id_fkey"
            columns: ["slack_token_id"]
            isOneToOne: false
            referencedRelation: "user_slack_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_slack_channels_slack_token_id_fkey"
            columns: ["slack_token_id"]
            isOneToOne: false
            referencedRelation: "user_slack_tokens_safe"
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
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_teammate_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_teammates_safe"
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
      resource_forecasts: {
        Row: {
          ai_analysis: string | null
          confidence_level: string
          created_at: string
          forecast_data: Json
          forecast_type: string
          generated_by: string
          id: string
          project_id: string
          recommendations: Json | null
          sprints_ahead: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          ai_analysis?: string | null
          confidence_level?: string
          created_at?: string
          forecast_data?: Json
          forecast_type?: string
          generated_by: string
          id?: string
          project_id: string
          recommendations?: Json | null
          sprints_ahead?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          ai_analysis?: string | null
          confidence_level?: string
          created_at?: string
          forecast_data?: Json
          forecast_type?: string
          generated_by?: string
          id?: string
          project_id?: string
          recommendations?: Json | null
          sprints_ahead?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_forecasts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
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
      security_incident_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          incident_id: string | null
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          incident_id?: string | null
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          incident_id?: string | null
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_incident_audit_log_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "security_incidents"
            referencedColumns: ["id"]
          },
        ]
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
          accessed_user_id: string | null
          action: string | null
          created_at: string
          id: string
          ip_address: string | null
          legal_basis: string | null
          query_context: string | null
          table_accessed: string
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_user_id?: string | null
          action?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          legal_basis?: string | null
          query_context?: string | null
          table_accessed: string
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_user_id?: string | null
          action?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          legal_basis?: string | null
          query_context?: string | null
          table_accessed?: string
          user_id?: string
        }
        Relationships: []
      }
      slack_api_rate_limits: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      slack_webhook_audit: {
        Row: {
          action_type: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          success: boolean | null
          target_channel: string | null
          token_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          target_channel?: string | null
          token_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean | null
          target_channel?: string | null
          token_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      smart_nudges: {
        Row: {
          created_at: string
          dismissed_at: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          nudge_type: string
          project_id: string
          related_item_id: string | null
          related_item_type: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          nudge_type: string
          project_id: string
          related_item_id?: string | null
          related_item_type?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          nudge_type?: string
          project_id?: string
          related_item_id?: string | null
          related_item_type?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_nudges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pmi_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_burndown: {
        Row: {
          added_points: number
          completed_points: number
          created_at: string
          id: string
          remaining_points: number
          snapshot_date: string
          sprint_id: string
        }
        Insert: {
          added_points?: number
          completed_points?: number
          created_at?: string
          id?: string
          remaining_points?: number
          snapshot_date: string
          sprint_id: string
        }
        Update: {
          added_points?: number
          completed_points?: number
          created_at?: string
          id?: string
          remaining_points?: number
          snapshot_date?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_burndown_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "native_sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_planning_sessions: {
        Row: {
          agenda: string | null
          backlog_items: Json | null
          committed_points: number | null
          created_at: string | null
          created_by: string | null
          delivered_points: number | null
          discussion_topics: string[] | null
          id: string
          meeting_minutes: string | null
          outlook_event_id: string | null
          project_id: string
          sprint_end_date: string | null
          sprint_goal: string | null
          sprint_number: number
          sprint_start_date: string | null
          status: string | null
          story_points_estimate: number | null
          updated_at: string | null
          velocity_data: Json | null
          workspace_id: string | null
        }
        Insert: {
          agenda?: string | null
          backlog_items?: Json | null
          committed_points?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_points?: number | null
          discussion_topics?: string[] | null
          id?: string
          meeting_minutes?: string | null
          outlook_event_id?: string | null
          project_id: string
          sprint_end_date?: string | null
          sprint_goal?: string | null
          sprint_number: number
          sprint_start_date?: string | null
          status?: string | null
          story_points_estimate?: number | null
          updated_at?: string | null
          velocity_data?: Json | null
          workspace_id?: string | null
        }
        Update: {
          agenda?: string | null
          backlog_items?: Json | null
          committed_points?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_points?: number | null
          discussion_topics?: string[] | null
          id?: string
          meeting_minutes?: string | null
          outlook_event_id?: string | null
          project_id?: string
          sprint_end_date?: string | null
          sprint_goal?: string | null
          sprint_number?: number
          sprint_start_date?: string | null
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
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "project_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["workspace_id_legacy"]
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
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "project_workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["workspace_id_legacy"]
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
          {
            foreignKeyName: "sprint_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      sprint_velocity_history: {
        Row: {
          committed_points: number | null
          created_at: string | null
          delivered_points: number | null
          id: string
          notes: string | null
          project_id: string
          sprint_end_date: string | null
          sprint_number: number
          sprint_start_date: string | null
          team_size: number | null
          updated_at: string | null
          velocity: number | null
        }
        Insert: {
          committed_points?: number | null
          created_at?: string | null
          delivered_points?: number | null
          id?: string
          notes?: string | null
          project_id: string
          sprint_end_date?: string | null
          sprint_number: number
          sprint_start_date?: string | null
          team_size?: number | null
          updated_at?: string | null
          velocity?: number | null
        }
        Update: {
          committed_points?: number | null
          created_at?: string | null
          delivered_points?: number | null
          id?: string
          notes?: string | null
          project_id?: string
          sprint_end_date?: string | null
          sprint_number?: number
          sprint_start_date?: string | null
          team_size?: number | null
          updated_at?: string | null
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sprint_velocity_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_velocity_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      stakeholder_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          notify_email: boolean | null
          notify_teams: boolean | null
          project_id: string | null
          threshold_operator: string | null
          threshold_value: number | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          notify_email?: boolean | null
          notify_teams?: boolean | null
          project_id?: string | null
          threshold_operator?: string | null
          threshold_value?: number | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          notify_email?: boolean | null
          notify_teams?: boolean | null
          project_id?: string | null
          threshold_operator?: string | null
          threshold_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      stakeholder_widget_configs: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: number
          project_id: string | null
          updated_at: string | null
          user_id: string
          widget_type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
          project_id?: string | null
          updated_at?: string | null
          user_id: string
          widget_type: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number
          project_id?: string | null
          updated_at?: string | null
          user_id?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_widget_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_widget_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
            foreignKeyName: "standup_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "standup_updates_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standup_updates_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members_safe"
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
          is_anonymous: boolean | null
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
          is_anonymous?: boolean | null
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
          is_anonymous?: boolean | null
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
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      token_access_audit: {
        Row: {
          accessed_at: string | null
          action: string
          id: string
          ip_address: string | null
          token_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          action: string
          id?: string
          ip_address?: string | null
          token_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          action?: string
          id?: string
          ip_address?: string | null
          token_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
          ip_address_hash: string | null
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
          ip_address_hash?: string | null
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
          ip_address_hash?: string | null
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
          encrypted_access_token: string | null
          encrypted_token: string | null
          github_username: string | null
          id: string
          is_valid: boolean | null
          last_validated_at: string | null
          oauth_provider: string | null
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          validation_error: string | null
        }
        Insert: {
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_token?: string | null
          github_username?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          validation_error?: string | null
        }
        Update: {
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_token?: string | null
          github_username?: string | null
          id?: string
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          validation_error?: string | null
        }
        Relationships: []
      }
      user_google_tokens: {
        Row: {
          access_token_encrypted: string
          created_at: string
          expires_at: string | null
          id: string
          refresh_token_encrypted: string | null
          scopes: string[] | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token_encrypted?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_jira_tokens: {
        Row: {
          cloud_id: string | null
          created_at: string
          encrypted_access_token: string | null
          encrypted_jira_email: string | null
          encrypted_jira_site_url: string | null
          encrypted_refresh_token: string | null
          encrypted_token: string | null
          id: string
          is_valid: boolean | null
          jira_email: string
          jira_site_url: string
          last_validated_at: string | null
          oauth_provider: string | null
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
          encrypted_access_token?: string | null
          encrypted_jira_email?: string | null
          encrypted_jira_site_url?: string | null
          encrypted_refresh_token?: string | null
          encrypted_token?: string | null
          id?: string
          is_valid?: boolean | null
          jira_email: string
          jira_site_url: string
          last_validated_at?: string | null
          oauth_provider?: string | null
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
          encrypted_access_token?: string | null
          encrypted_jira_email?: string | null
          encrypted_jira_site_url?: string | null
          encrypted_refresh_token?: string | null
          encrypted_token?: string | null
          id?: string
          is_valid?: boolean | null
          jira_email?: string
          jira_site_url?: string
          last_validated_at?: string | null
          oauth_provider?: string | null
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
          encryption_version: number | null
          expires_at: string | null
          id: string
          is_valid: boolean | null
          key_rotation_required: boolean | null
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
          encryption_version?: number | null
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          key_rotation_required?: boolean | null
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
          encryption_version?: number | null
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          key_rotation_required?: boolean | null
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
          {
            foreignKeyName: "value_streams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks_safe"
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
          {
            foreignKeyName: "webhooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
          {
            foreignKeyName: "workflow_executions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
          cost_estimate: number | null
          created_at: string | null
          endpoint: string | null
          id: string | null
          model: string | null
          status: string | null
          tokens_used: number | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          endpoint?: string | null
          id?: string | null
          model?: string | null
          status?: string | null
          tokens_used?: number | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          endpoint?: string | null
          id?: string | null
          model?: string | null
          status?: string | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      profiles_safe: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_activity_at: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          last_activity_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          full_name?: string | null
          id?: string | null
          last_activity_at?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_teammate_safe: {
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
      project_teammates: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          member_role: string | null
          project_id: string | null
          user_id: string | null
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
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
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
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_teammate_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_teammates_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      project_teammates_safe: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      team_members_safe: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          project_id: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: never
          id?: string | null
          name?: string | null
          project_id?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: never
          id?: string | null
          name?: string | null
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
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
      unified_project_integrations: {
        Row: {
          configuration_status: string | null
          github_active: boolean | null
          github_integration_id: string | null
          github_repo_name: string | null
          github_repo_url: string | null
          jira_active: boolean | null
          jira_board_id: string | null
          jira_board_url: string | null
          jira_integration_id: string | null
          microsoft_active: boolean | null
          microsoft_integration_id: string | null
          outlook_calendar_id: string | null
          project_id: string | null
          project_name: string | null
          slack_active: boolean | null
          slack_integration_id: string | null
          team_distribution_list: string | null
          teams_channel_id: string | null
          workspace_id: string | null
          workspace_id_legacy: string | null
          workspace_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_github_tokens_safe: {
        Row: {
          created_at: string | null
          has_refresh_token: boolean | null
          has_token: boolean | null
          is_valid: boolean | null
          last_validated_at: string | null
          oauth_provider: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          has_refresh_token?: never
          has_token?: never
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          has_refresh_token?: never
          has_token?: never
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_jira_tokens_safe: {
        Row: {
          cloud_id: string | null
          created_at: string | null
          has_jira_email: boolean | null
          has_jira_site_url: boolean | null
          has_refresh_token: boolean | null
          has_token: boolean | null
          is_valid: boolean | null
          last_validated_at: string | null
          oauth_provider: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
          validation_error: string | null
        }
        Insert: {
          cloud_id?: string | null
          created_at?: string | null
          has_jira_email?: never
          has_jira_site_url?: never
          has_refresh_token?: never
          has_token?: never
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          validation_error?: string | null
        }
        Update: {
          cloud_id?: string | null
          created_at?: string | null
          has_jira_email?: never
          has_jira_site_url?: never
          has_refresh_token?: never
          has_token?: never
          is_valid?: boolean | null
          last_validated_at?: string | null
          oauth_provider?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          validation_error?: string | null
        }
        Relationships: []
      }
      user_microsoft_token_status: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string | null
          is_valid: boolean | null
          last_validated_at: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          validation_error: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_valid?: boolean | null
          last_validated_at?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          validation_error?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_valid?: boolean | null
          last_validated_at?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          validation_error?: string | null
        }
        Relationships: []
      }
      user_microsoft_tokens_safe: {
        Row: {
          created_at: string | null
          expires_at: string | null
          has_access_token: boolean | null
          has_refresh_token: boolean | null
          id: string | null
          is_valid: boolean | null
          scopes: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          has_access_token?: never
          has_refresh_token?: never
          id?: string | null
          is_valid?: boolean | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          has_access_token?: never
          has_refresh_token?: never
          id?: string | null
          is_valid?: boolean | null
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_slack_tokens_safe: {
        Row: {
          channel_id: string | null
          channel_name: string | null
          created_at: string | null
          has_access_token: boolean | null
          has_bot_token: boolean | null
          has_webhook: boolean | null
          id: string | null
          is_valid: boolean | null
          last_validated_at: string | null
          scopes: string[] | null
          team_id: string | null
          team_name: string | null
          updated_at: string | null
          user_id: string | null
          validation_error: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          has_access_token?: never
          has_bot_token?: never
          has_webhook?: never
          id?: string | null
          is_valid?: boolean | null
          last_validated_at?: string | null
          scopes?: string[] | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          validation_error?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          has_access_token?: never
          has_bot_token?: never
          has_webhook?: never
          id?: string | null
          is_valid?: boolean | null
          last_validated_at?: string | null
          scopes?: string[] | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          validation_error?: string | null
        }
        Relationships: []
      }
      user_subscription_info: {
        Row: {
          current_period_end: string | null
          current_period_start: string | null
          features: Json | null
          project_limit: number | null
          status: string | null
          team_member_limit: number | null
          tier_name: string | null
          user_id: string | null
        }
        Relationships: []
      }
      webhooks_safe: {
        Row: {
          created_at: string | null
          events: string[] | null
          has_secret: boolean | null
          id: string | null
          is_active: boolean | null
          project_id: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events?: string[] | null
          has_secret?: never
          id?: string | null
          is_active?: boolean | null
          project_id?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[] | null
          has_secret?: never
          id?: string | null
          is_active?: boolean | null
          project_id?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "unified_project_integrations"
            referencedColumns: ["project_id"]
          },
        ]
      }
    }
    Functions: {
      anonymize_deleted_user_data: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      anonymize_ip_address: { Args: { ip: string }; Returns: string }
      anonymize_old_ai_usage_logs: { Args: never; Returns: number }
      anonymize_user_data: {
        Args: { target_user_id: string }
        Returns: boolean
      }
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
      can_view_project_roster: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      check_integration_status: {
        Args: { integration_id: string }
        Returns: {
          id: string
          integration_type: string
          is_active: boolean
          last_tested: string
        }[]
      }
      check_slack_rate_limit: {
        Args: {
          p_action_type: string
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_user_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_old_access_logs:
        | { Args: never; Returns: undefined }
        | { Args: { days_to_keep?: number }; Returns: number }
      cleanup_old_knowledge_entries: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      cleanup_project_member_access_logs: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      cleanup_slack_audit_logs: { Args: never; Returns: number }
      create_epic_progress_snapshot: {
        Args: { epic_id_param: string }
        Returns: undefined
      }
      enforce_ai_usage_data_retention: { Args: never; Returns: number }
      export_user_data: { Args: { target_user_id: string }; Returns: Json }
      generate_breach_audit_hash: {
        Args: {
          p_accessed_at: string
          p_action: string
          p_breach_id: string
          p_user_id: string
        }
        Returns: string
      }
      generate_consent_hash: {
        Args: {
          p_consent_given: boolean
          p_consent_type: string
          p_recorded_at: string
          p_user_id: string
        }
        Returns: string
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
      get_breach_log_by_id: {
        Args: { breach_id_param: string }
        Returns: {
          affected_data_types: string[] | null
          affected_user_count: number | null
          breach_type: string
          containment_actions: string[] | null
          created_by: string | null
          description: string | null
          detected_at: string | null
          id: string
          notification_sent_at: string | null
          resolved_at: string | null
          severity: string | null
          supervisory_authority_notified: boolean | null
        }
        SetofOptions: {
          from: "*"
          to: "data_breach_log"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_breach_logs_with_audit: {
        Args: never
        Returns: {
          affected_data_types: string[] | null
          affected_user_count: number | null
          breach_type: string
          containment_actions: string[] | null
          created_by: string | null
          description: string | null
          detected_at: string | null
          id: string
          notification_sent_at: string | null
          resolved_at: string | null
          severity: string | null
          supervisory_authority_notified: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "data_breach_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_ceremony_outlook_status: {
        Args: { ceremony_id: string }
        Returns: boolean
      }
      get_data_breach_with_audit: {
        Args: { breach_id_param?: string }
        Returns: {
          affected_data_types: string[] | null
          affected_user_count: number | null
          breach_type: string
          containment_actions: string[] | null
          created_by: string | null
          description: string | null
          detected_at: string | null
          id: string
          notification_sent_at: string | null
          resolved_at: string | null
          severity: string | null
          supervisory_authority_notified: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "data_breach_log"
          isOneToOne: false
          isSetofReturn: true
        }
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
      get_my_consent_status: {
        Args: never
        Returns: {
          consent_given: boolean
          consent_type: string
          granted_at: string
          history_count: number
          withdrawn_at: string
        }[]
      }
      get_my_data_access_logs: {
        Args: { limit_count?: number }
        Returns: {
          access_type: string
          accessed_at: string
          context: string
          table_name: string
        }[]
      }
      get_my_integration_status: {
        Args: never
        Returns: {
          expires_soon: boolean
          integration_type: string
          is_connected: boolean
          is_valid: boolean
          last_used: string
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
      get_pending_approvals_count: {
        Args: { p_user_id: string }
        Returns: number
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
      get_profile_safe: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          role: string
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
      get_project_member_count: {
        Args: { p_project_id: string }
        Returns: number
      }
      get_project_members_gdpr: {
        Args: { p_project_id: string }
        Returns: {
          created_at: string
          id: string
          is_full_access: boolean
          member_avatar: string
          member_name: string
          project_id: string
          role: string
          user_id: string
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
      get_sprint_commitment_accuracy: {
        Args: { limit_sprints?: number; project_id_param: string }
        Returns: {
          accuracy_percentage: number
          committed_points: number
          delivered_points: number
          sprint_date: string
          sprint_number: number
        }[]
      }
      get_teammate_profile_safe: {
        Args: { teammate_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
        }[]
      }
      get_unified_integrations: {
        Args: { project_id_param: string }
        Returns: Json
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
      get_velocity_trends: {
        Args: { limit_sprints?: number; project_id_param: string }
        Returns: {
          delivered_points: number
          sprint_date: string
          sprint_number: number
          trend: string
          velocity: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_ip_address: { Args: { ip: string }; Returns: string }
      initialize_epic_closure_review: {
        Args: { epic_id_param: string }
        Returns: string
      }
      insert_security_incident_audit: {
        Args: {
          p_action: string
          p_incident_id: string
          p_new_data: Json
          p_old_data: Json
          p_user_id: string
        }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_platform_owner: { Args: { user_id: string }; Returns: boolean }
      is_pmi_project_member: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_stakeholder: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      is_security_admin: { Args: { user_id: string }; Returns: boolean }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      log_slack_webhook_usage: {
        Args: {
          p_action_type: string
          p_error_message?: string
          p_success?: boolean
          p_target_channel?: string
          p_token_id: string
        }
        Returns: undefined
      }
      mask_email: {
        Args: { email_value: string; owner_id: string }
        Returns: string
      }
      mask_teammate_email:
        | {
            Args: { email: string; profile_id: string; viewer_id: string }
            Returns: string
          }
        | {
            Args: { email_value: string; profile_owner_id: string }
            Returns: string
          }
      record_consent_change: {
        Args: {
          p_consent_given: boolean
          p_consent_text?: string
          p_consent_type: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      sanitize_webhook_payload: { Args: { payload: Json }; Returns: Json }
      search_project_knowledge: {
        Args: {
          content_types?: string[]
          match_count?: number
          query_embedding: string
          query_text: string
          similarity_threshold?: number
          target_project_id: string
        }
        Returns: {
          combined_score: number
          content: string
          content_type: string
          created_at: string
          id: string
          metadata: Json
          similarity: number
          text_rank: number
          title: string
        }[]
      }
      toggle_integration_status: {
        Args: { integration_id: string; new_status: boolean }
        Returns: boolean
      }
      validate_slack_webhook_exists: {
        Args: { p_token_id: string }
        Returns: Json
      }
      verify_consent_integrity: {
        Args: { p_history_id: string }
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
