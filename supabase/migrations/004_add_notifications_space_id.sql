-- =====================================================
-- 004. ADD SPACE_ID TO NOTIFICATIONS
-- =====================================================
-- Run this if you already executed FULL_SETUP.sql
-- Adds space_id column to notifications for space-scoped filtering

-- Add space_id column (nullable for backwards compatibility)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS space_id BIGINT REFERENCES public.spaces(id) ON DELETE CASCADE;

-- Add index for faster space-scoped queries
CREATE INDEX IF NOT EXISTS idx_notifications_space_id ON notifications(space_id);

-- Add RLS policy for space-scoped notifications
-- Users can view notifications for spaces they belong to
DROP POLICY IF EXISTS "View space notifications" ON notifications;
CREATE POLICY "View space notifications" ON notifications 
  FOR SELECT USING (
    space_id IS NULL AND user_id = auth.uid()
    OR 
    space_id IS NOT NULL AND is_user_in_space(space_id)
  );

-- Allow inserting space-scoped notifications
DROP POLICY IF EXISTS "Create space notifications" ON notifications;
CREATE POLICY "Create space notifications" ON notifications 
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Add delete policy for bulk operations
DROP POLICY IF EXISTS "Delete own notifications" ON notifications;
CREATE POLICY "Delete own notifications" ON notifications 
  FOR DELETE USING (user_id = auth.uid());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
