
-- Fix the overly permissive INSERT policy on notifications
-- Notifications are inserted by SECURITY DEFINER triggers, so we restrict direct inserts
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also allow deletion of own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
