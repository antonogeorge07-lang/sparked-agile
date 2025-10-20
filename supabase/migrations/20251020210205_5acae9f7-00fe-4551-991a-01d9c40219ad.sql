-- Enable realtime for action_items table
ALTER TABLE public.action_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.action_items;

-- Enable realtime for workflow_executions table
ALTER TABLE public.workflow_executions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_executions;

-- Enable realtime for integrations table
ALTER TABLE public.integrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.integrations;