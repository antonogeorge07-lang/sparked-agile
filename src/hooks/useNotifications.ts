import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Info, Zap } from "lucide-react";

interface UseNotificationsOptions {
  userId?: string;
  enabled?: boolean;
}

export const useNotifications = ({ userId, enabled = true }: UseNotificationsOptions) => {
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!enabled || !userId) return;

    // Channel for action items
    const actionItemsChannel = supabase
      .channel('action-items-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'action_items'
        },
        (payload) => {
          const actionItem = payload.new;
          toast({
            title: "New Action Item Created",
            description: `${actionItem.title} - Priority: ${actionItem.priority}`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'action_items'
        },
        (payload) => {
          const actionItem = payload.new;
          const oldItem = payload.old;
          
          // Notify on status change to completed
          if (oldItem.status !== 'completed' && actionItem.status === 'completed') {
            toast({
              title: "Action Item Completed! 🎉",
              description: actionItem.title,
              duration: 5000,
            });
          }
          // Notify on priority escalation
          else if (oldItem.priority !== actionItem.priority && 
                   (actionItem.priority === 'critical' || actionItem.priority === 'high')) {
            toast({
              title: "Action Item Priority Updated",
              description: `${actionItem.title} - Now ${actionItem.priority} priority`,
              variant: "destructive",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Channel for workflow executions
    const workflowChannel = supabase
      .channel('workflow-executions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_executions'
        },
        (payload) => {
          const workflow = payload.new;
          if (workflow.status === 'pending') {
            toast({
              title: "Workflow Started",
              description: `Processing ${workflow.workflow_type.replace('_', ' ')}...`,
              duration: 3000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflow_executions'
        },
        (payload) => {
          const workflow = payload.new;
          const oldWorkflow = payload.old;
          
          // Notify on completion
          if (oldWorkflow.status !== 'completed' && workflow.status === 'completed') {
            toast({
              title: "Workflow Completed Successfully! ✓",
              description: `${workflow.workflow_type.replace('_', ' ')} finished in ${workflow.execution_time_ms}ms`,
              duration: 5000,
            });
          }
          // Notify on error
          else if (oldWorkflow.status !== 'error' && workflow.status === 'error') {
            toast({
              title: "Workflow Failed",
              description: workflow.error_message || "An error occurred during workflow execution",
              variant: "destructive",
              duration: 7000,
            });
          }
        }
      )
      .subscribe();

    // Channel for integration sync status
    const integrationChannel = supabase
      .channel('integration-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'integrations'
        },
        (payload) => {
          const integration = payload.new;
          toast({
            title: "Integration Connected",
            description: `${integration.name} (${integration.integration_type}) is now active`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'integrations'
        },
        (payload) => {
          const integration = payload.new;
          const oldIntegration = payload.old;
          
          // Notify on activation status change
          if (oldIntegration.is_active !== integration.is_active) {
            toast({
              title: integration.is_active ? "Integration Activated" : "Integration Deactivated",
              description: `${integration.name} (${integration.integration_type})`,
              duration: 4000,
            });
          }
          // Notify on status change only (config is no longer accessible)
        }
      )
      .subscribe();

    channelsRef.current = [actionItemsChannel, workflowChannel, integrationChannel];

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [userId, enabled]);

  return null;
};
