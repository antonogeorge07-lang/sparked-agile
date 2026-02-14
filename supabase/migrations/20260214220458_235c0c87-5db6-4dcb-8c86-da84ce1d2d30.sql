
-- =====================================================
-- SECURITY HARDENING: Restrict all TO public policies to TO authenticated
-- This prevents the anon role from attempting access on protected tables
-- Excludes: RESTRICTIVE deny policies, public storage, cron jobs
-- =====================================================

-- action_items
ALTER POLICY "Project members can manage action items" ON public.action_items TO authenticated;
ALTER POLICY "Users can view action items of allocated projects" ON public.action_items TO authenticated;

-- agent_consensus_votes
ALTER POLICY "System inserts consensus votes" ON public.agent_consensus_votes TO authenticated;
ALTER POLICY "Users view consensus votes" ON public.agent_consensus_votes TO authenticated;

-- agent_debate_responses
ALTER POLICY "System inserts debate responses" ON public.agent_debate_responses TO authenticated;
ALTER POLICY "Users view debate responses" ON public.agent_debate_responses TO authenticated;

-- agent_debate_sessions
ALTER POLICY "System updates debate sessions" ON public.agent_debate_sessions TO authenticated;
ALTER POLICY "Users create debates for own projects" ON public.agent_debate_sessions TO authenticated;
ALTER POLICY "Users view own project debates" ON public.agent_debate_sessions TO authenticated;

-- aggregation_access_limits
ALTER POLICY "Admins can view aggregation limits" ON public.aggregation_access_limits TO authenticated;
ALTER POLICY "Users can manage own rate limits" ON public.aggregation_access_limits TO authenticated;

-- agile_release_trains
ALTER POLICY "Project members can manage ARTs" ON public.agile_release_trains TO authenticated;
ALTER POLICY "Users can view ARTs of allocated value streams" ON public.agile_release_trains TO authenticated;

-- ai_suggestions
ALTER POLICY "System can create AI suggestions" ON public.ai_suggestions TO authenticated;
ALTER POLICY "Users can update AI suggestion status" ON public.ai_suggestions TO authenticated;
ALTER POLICY "Users can view AI suggestions for their projects" ON public.ai_suggestions TO authenticated;

-- ai_usage_logs
ALTER POLICY "Users can only insert own AI usage logs" ON public.ai_usage_logs TO authenticated;
ALTER POLICY "Users can view only own AI usage logs" ON public.ai_usage_logs TO authenticated;

-- approval_requests
ALTER POLICY "Approvers can update assigned requests" ON public.approval_requests TO authenticated;
ALTER POLICY "Users create own approval requests" ON public.approval_requests TO authenticated;
ALTER POLICY "Users view relevant approval requests" ON public.approval_requests TO authenticated;

-- board_columns
ALTER POLICY "Users can manage board columns for their projects" ON public.board_columns TO authenticated;
ALTER POLICY "Users can view board columns for their projects" ON public.board_columns TO authenticated;

-- ceremony_configs
ALTER POLICY "Users can manage ceremony configs" ON public.ceremony_configs TO authenticated;
ALTER POLICY "Users can view ceremony configs" ON public.ceremony_configs TO authenticated;

-- ceremony_reminders
ALTER POLICY "Users can create reminders for their projects" ON public.ceremony_reminders TO authenticated;
ALTER POLICY "Users can update reminders for their projects" ON public.ceremony_reminders TO authenticated;
ALTER POLICY "Users can view reminders for their projects" ON public.ceremony_reminders TO authenticated;

-- data_breach_log - KEEP deny policies as TO public (RESTRICTIVE)
ALTER POLICY "Only security admins can view breach logs" ON public.data_breach_log TO authenticated;
ALTER POLICY "Security admins can insert breach logs" ON public.data_breach_log TO authenticated;

-- data_export_requests
ALTER POLICY "Users can create their own export requests" ON public.data_export_requests TO authenticated;
ALTER POLICY "Users can view their own export requests" ON public.data_export_requests TO authenticated;

-- dependencies
ALTER POLICY "Project members can manage dependencies" ON public.dependencies TO authenticated;
ALTER POLICY "Users can view dependencies of allocated features" ON public.dependencies TO authenticated;

-- digest_history
ALTER POLICY "Users view own digest history" ON public.digest_history TO authenticated;

-- digest_subscriptions
ALTER POLICY "Users manage own digest subscriptions" ON public.digest_subscriptions TO authenticated;

-- epic_closure_reviews
ALTER POLICY "Project members can manage epic closure reviews" ON public.epic_closure_reviews TO authenticated;
ALTER POLICY "Users can view epic closure reviews of allocated projects" ON public.epic_closure_reviews TO authenticated;

-- epic_dependencies
ALTER POLICY "Project members can manage epic dependencies" ON public.epic_dependencies TO authenticated;
ALTER POLICY "Users can view epic dependencies of allocated projects" ON public.epic_dependencies TO authenticated;

-- epic_impact_metrics
ALTER POLICY "Project members can manage epic impact metrics" ON public.epic_impact_metrics TO authenticated;
ALTER POLICY "Users can view epic impact metrics of allocated projects" ON public.epic_impact_metrics TO authenticated;

-- epic_milestones
ALTER POLICY "Project members can manage epic milestones" ON public.epic_milestones TO authenticated;
ALTER POLICY "Users can view epic milestones of allocated projects" ON public.epic_milestones TO authenticated;

-- epic_progress_snapshots
ALTER POLICY "Project members can create progress snapshots" ON public.epic_progress_snapshots TO authenticated;
ALTER POLICY "Users can view epic progress snapshots" ON public.epic_progress_snapshots TO authenticated;

-- epic_readiness_checks
ALTER POLICY "Users can manage readiness checks for accessible epics" ON public.epic_readiness_checks TO authenticated;
ALTER POLICY "Users can update readiness checks for accessible epics" ON public.epic_readiness_checks TO authenticated;
ALTER POLICY "Users can view readiness checks for accessible epics" ON public.epic_readiness_checks TO authenticated;

-- epic_recalibration_log
ALTER POLICY "Users can insert recalibration logs" ON public.epic_recalibration_log TO authenticated;
ALTER POLICY "Users can view recalibration logs for accessible epics" ON public.epic_recalibration_log TO authenticated;

-- epic_roi_tracking
ALTER POLICY "Project members can manage epic ROI" ON public.epic_roi_tracking TO authenticated;
ALTER POLICY "Users can view epic ROI of allocated projects" ON public.epic_roi_tracking TO authenticated;

-- epic_stakeholders
ALTER POLICY "Project members can manage epic stakeholders" ON public.epic_stakeholders TO authenticated;
ALTER POLICY "Project members can view epic stakeholders" ON public.epic_stakeholders TO authenticated;

-- epic_validation_items
ALTER POLICY "Users can insert validation items" ON public.epic_validation_items TO authenticated;
ALTER POLICY "Users can update validation items they have access to" ON public.epic_validation_items TO authenticated;
ALTER POLICY "Users can view validation items via run access" ON public.epic_validation_items TO authenticated;

-- epic_validation_runs
ALTER POLICY "Users can create validation runs for their epics" ON public.epic_validation_runs TO authenticated;
ALTER POLICY "Users can update validation runs they have access to" ON public.epic_validation_runs TO authenticated;
ALTER POLICY "Users can view validation runs for accessible epics" ON public.epic_validation_runs TO authenticated;

-- epics
ALTER POLICY "Project members can manage epics" ON public.epics TO authenticated;
ALTER POLICY "Users can view epics of allocated value streams" ON public.epics TO authenticated;

-- features
ALTER POLICY "Project members can manage features" ON public.features TO authenticated;
ALTER POLICY "Users can view features of allocated epics" ON public.features TO authenticated;

-- flow_metrics
ALTER POLICY "Project members can manage flow metrics" ON public.flow_metrics TO authenticated;
ALTER POLICY "Users can view flow metrics of allocated projects" ON public.flow_metrics TO authenticated;

-- gdpr_consent_history
ALTER POLICY "Users can view own consent history" ON public.gdpr_consent_history TO authenticated;

-- gdpr_consent_records - KEEP deny policies as TO public
-- "No deletes to consent records" and "No updates to consent records" stay

-- integrations
ALTER POLICY "Admins can manage integrations via functions" ON public.integrations TO authenticated;
ALTER POLICY "Project members can view integration metadata only" ON public.integrations TO authenticated;

-- item_activity_log
ALTER POLICY "System can create activity logs" ON public.item_activity_log TO authenticated;
ALTER POLICY "Users can view activity for their items" ON public.item_activity_log TO authenticated;

-- item_attachments
ALTER POLICY "Users can delete their own attachments" ON public.item_attachments TO authenticated;
ALTER POLICY "Users can upload attachments to accessible items" ON public.item_attachments TO authenticated;
ALTER POLICY "Users can view attachments on accessible items" ON public.item_attachments TO authenticated;

-- item_comments
ALTER POLICY "Users can create comments on accessible items" ON public.item_comments TO authenticated;
ALTER POLICY "Users can delete their own comments" ON public.item_comments TO authenticated;
ALTER POLICY "Users can update their own comments" ON public.item_comments TO authenticated;
ALTER POLICY "Users can view comments on accessible items" ON public.item_comments TO authenticated;

-- lessons_learned
ALTER POLICY "Users can create lessons in their projects" ON public.lessons_learned TO authenticated;
ALTER POLICY "Users can view lessons in their projects" ON public.lessons_learned TO authenticated;

-- native_backlog_items
ALTER POLICY "Users can create backlog items for their projects" ON public.native_backlog_items TO authenticated;
ALTER POLICY "Users can delete backlog items for their projects" ON public.native_backlog_items TO authenticated;
ALTER POLICY "Users can update backlog items for their projects" ON public.native_backlog_items TO authenticated;
ALTER POLICY "Users can view backlog items for their projects" ON public.native_backlog_items TO authenticated;

-- native_sprints
ALTER POLICY "Users can create sprints for their projects" ON public.native_sprints TO authenticated;
ALTER POLICY "Users can delete sprints for their projects" ON public.native_sprints TO authenticated;
ALTER POLICY "Users can update sprints for their projects" ON public.native_sprints TO authenticated;
ALTER POLICY "Users can view sprints for their projects" ON public.native_sprints TO authenticated;

-- notifications
ALTER POLICY "Authenticated users can insert own notifications" ON public.notifications TO authenticated;
ALTER POLICY "Users can delete own notifications" ON public.notifications TO authenticated;
ALTER POLICY "Users can update own notifications" ON public.notifications TO authenticated;
ALTER POLICY "Users can view own notifications" ON public.notifications TO authenticated;

-- okrs
ALTER POLICY "Project members can manage OKRs" ON public.okrs TO authenticated;
ALTER POLICY "Users can view OKRs of allocated PIs" ON public.okrs TO authenticated;

-- onboarding_progress
ALTER POLICY "Users can insert own onboarding progress" ON public.onboarding_progress TO authenticated;
ALTER POLICY "Users can update own onboarding progress" ON public.onboarding_progress TO authenticated;
ALTER POLICY "Users can view own onboarding progress" ON public.onboarding_progress TO authenticated;

-- pmi_projects
ALTER POLICY "Users can create their own projects" ON public.pmi_projects TO authenticated;
ALTER POLICY "Users can delete their own projects" ON public.pmi_projects TO authenticated;
ALTER POLICY "Users can update their own projects" ON public.pmi_projects TO authenticated;
ALTER POLICY "Users can view their own projects" ON public.pmi_projects TO authenticated;

-- pmi_tasks
ALTER POLICY "Users can create tasks in their projects" ON public.pmi_tasks TO authenticated;
ALTER POLICY "Users can delete tasks in their projects" ON public.pmi_tasks TO authenticated;
ALTER POLICY "Users can update tasks in their projects" ON public.pmi_tasks TO authenticated;
ALTER POLICY "Users can view tasks in their projects" ON public.pmi_tasks TO authenticated;

-- profile_access_log
ALTER POLICY "Users can delete own access logs" ON public.profile_access_log TO authenticated;
ALTER POLICY "Users can log profile access" ON public.profile_access_log TO authenticated;
ALTER POLICY "Users can view own access logs" ON public.profile_access_log TO authenticated;

-- program_increments
ALTER POLICY "Project members can manage PIs" ON public.program_increments TO authenticated;
ALTER POLICY "Users can view PIs of allocated ARTs" ON public.program_increments TO authenticated;

-- project_members
ALTER POLICY "Admins can delete members" ON public.project_members TO authenticated;
ALTER POLICY "Admins can manage all members" ON public.project_members TO authenticated;
ALTER POLICY "Project members can see leadership" ON public.project_members TO authenticated;
ALTER POLICY "Workspace members can join workspace projects" ON public.project_members TO authenticated;

-- project_milestones
ALTER POLICY "Users can manage milestones in their projects" ON public.project_milestones TO authenticated;
ALTER POLICY "Users can view milestones in their projects" ON public.project_milestones TO authenticated;

-- project_slack_channels
ALTER POLICY "Project members can manage Slack channels" ON public.project_slack_channels TO authenticated;

-- project_tasks
ALTER POLICY "Project members can create project tasks" ON public.project_tasks TO authenticated;
ALTER POLICY "Project members can delete project tasks" ON public.project_tasks TO authenticated;
ALTER POLICY "Project members can update project tasks" ON public.project_tasks TO authenticated;
ALTER POLICY "Project members can view project tasks" ON public.project_tasks TO authenticated;

-- project_usage_stats
ALTER POLICY "Admins can view all usage stats" ON public.project_usage_stats TO authenticated;
ALTER POLICY "Project members can view usage stats" ON public.project_usage_stats TO authenticated;
ALTER POLICY "System can insert usage stats" ON public.project_usage_stats TO authenticated;
ALTER POLICY "System can update usage stats" ON public.project_usage_stats TO authenticated;

-- project_workspaces
ALTER POLICY "Project members can view workspaces" ON public.project_workspaces TO authenticated;

-- projects
ALTER POLICY "Project owners can update their projects" ON public.projects TO authenticated;
ALTER POLICY "Users can manage their workspace projects" ON public.projects TO authenticated;
ALTER POLICY "Users can view allocated projects" ON public.projects TO authenticated;
ALTER POLICY "Users can view their workspace projects" ON public.projects TO authenticated;

-- risk_register
ALTER POLICY "Users can manage risks in their projects" ON public.risk_register TO authenticated;
ALTER POLICY "Users can view risks in their projects" ON public.risk_register TO authenticated;

-- satisfaction_surveys
ALTER POLICY "Admins can manage all surveys" ON public.satisfaction_surveys TO authenticated;
ALTER POLICY "Authenticated users can view active surveys" ON public.satisfaction_surveys TO authenticated;

-- security_incident_audit_log
ALTER POLICY "Only admins can view security audit logs" ON public.security_incident_audit_log TO authenticated;

-- sensitive_data_access_log
ALTER POLICY "Users can insert own access logs" ON public.sensitive_data_access_log TO authenticated;

-- slack_api_rate_limits
ALTER POLICY "Users can manage own rate limits" ON public.slack_api_rate_limits TO authenticated;

-- sprint_burndown
ALTER POLICY "System can manage burndown snapshots" ON public.sprint_burndown TO authenticated;
ALTER POLICY "Users can view burndown for their sprints" ON public.sprint_burndown TO authenticated;

-- sprint_planning_sessions
ALTER POLICY "Project members can manage sprint planning sessions" ON public.sprint_planning_sessions TO authenticated;
ALTER POLICY "Project members can view sprint planning sessions" ON public.sprint_planning_sessions TO authenticated;

-- sprint_review_sessions
ALTER POLICY "Project members can manage sprint review sessions" ON public.sprint_review_sessions TO authenticated;
ALTER POLICY "Project members can view sprint review sessions" ON public.sprint_review_sessions TO authenticated;

-- sprint_summaries
ALTER POLICY "Project members can create sprint summaries" ON public.sprint_summaries TO authenticated;
ALTER POLICY "Users can view sprint summaries of allocated projects" ON public.sprint_summaries TO authenticated;

-- sprint_velocity_history
ALTER POLICY "Users can insert velocity for their projects" ON public.sprint_velocity_history TO authenticated;
ALTER POLICY "Users can update velocity for their projects" ON public.sprint_velocity_history TO authenticated;
ALTER POLICY "Users can view velocity for their projects" ON public.sprint_velocity_history TO authenticated;

-- stakeholder_alerts
ALTER POLICY "Users manage own alerts" ON public.stakeholder_alerts TO authenticated;

-- stakeholder_widget_configs
ALTER POLICY "Users manage own widget configs" ON public.stakeholder_widget_configs TO authenticated;

-- standup_updates
ALTER POLICY "Project members can create standups" ON public.standup_updates TO authenticated;
ALTER POLICY "Users can view standups of allocated projects" ON public.standup_updates TO authenticated;

-- subscription_tiers
ALTER POLICY "Admins can manage subscription tiers" ON public.subscription_tiers TO authenticated;

-- survey_responses
ALTER POLICY "Admins can view all responses" ON public.survey_responses TO authenticated;
ALTER POLICY "Users can create survey responses" ON public.survey_responses TO authenticated;
ALTER POLICY "Users can view their own responses" ON public.survey_responses TO authenticated;

-- user_activity_logs
ALTER POLICY "Admins can view all activity" ON public.user_activity_logs TO authenticated;
ALTER POLICY "Users can view their own activity" ON public.user_activity_logs TO authenticated;

-- user_consents
ALTER POLICY "Users can insert their own consents" ON public.user_consents TO authenticated;
ALTER POLICY "Users can update their own consents" ON public.user_consents TO authenticated;
ALTER POLICY "Users can view their own consents" ON public.user_consents TO authenticated;

-- user_feedback
ALTER POLICY "Admins can update feedback status" ON public.user_feedback TO authenticated;
ALTER POLICY "Admins can view all feedback" ON public.user_feedback TO authenticated;
ALTER POLICY "Users can create feedback" ON public.user_feedback TO authenticated;
ALTER POLICY "Users can view their own feedback" ON public.user_feedback TO authenticated;

-- user_google_tokens
ALTER POLICY "Users can view own token existence" ON public.user_google_tokens TO authenticated;

-- user_roles
ALTER POLICY "Only admins can manage user roles" ON public.user_roles TO authenticated;
ALTER POLICY "Users can view their own roles" ON public.user_roles TO authenticated;

-- user_subscriptions
ALTER POLICY "Admins can view all subscriptions" ON public.user_subscriptions TO authenticated;
ALTER POLICY "System can insert subscriptions" ON public.user_subscriptions TO authenticated;
ALTER POLICY "Users can update their own subscription" ON public.user_subscriptions TO authenticated;
ALTER POLICY "Users can view their own subscription" ON public.user_subscriptions TO authenticated;

-- value_streams
ALTER POLICY "Project members can manage value streams" ON public.value_streams TO authenticated;
ALTER POLICY "Users can view value streams of allocated projects" ON public.value_streams TO authenticated;

-- webhook_deliveries
ALTER POLICY "Users can view their webhook deliveries" ON public.webhook_deliveries TO authenticated;

-- workflow_executions
ALTER POLICY "Project members can manage workflow executions" ON public.workflow_executions TO authenticated;
ALTER POLICY "Users can view workflow executions of allocated projects" ON public.workflow_executions TO authenticated;
