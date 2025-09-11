-- Add group_id column to meeting_choices if it doesn't exist
ALTER TABLE public.meeting_choices ADD COLUMN IF NOT EXISTS group_id INTEGER;

-- Create unique index to prevent duplicate choices per user per slot per group
CREATE UNIQUE INDEX IF NOT EXISTS meeting_choices_unique_group
ON public.meeting_choices (poll_id, user_id, slot_id, group_id);

-- Update RLS policies for group-based access
DROP POLICY IF EXISTS "select same group" ON public.meeting_choices;
DROP POLICY IF EXISTS "insert own row" ON public.meeting_choices;
DROP POLICY IF EXISTS "delete own row" ON public.meeting_choices;

-- Policy to select choices from same group
CREATE POLICY "select same group" ON public.meeting_choices
FOR SELECT USING (
  group_id IN (
    SELECT mc.group_id 
    FROM public.meeting_choices mc 
    WHERE mc.user_id = auth.uid()
  ) 
  OR user_id = auth.uid()
);

-- Policy to insert own choices
CREATE POLICY "insert own row" ON public.meeting_choices
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy to delete own choices
CREATE POLICY "delete own row" ON public.meeting_choices
FOR DELETE USING (user_id = auth.uid());