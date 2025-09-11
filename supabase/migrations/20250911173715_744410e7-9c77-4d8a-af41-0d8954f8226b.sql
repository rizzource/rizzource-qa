-- Add group_id column to meeting_choices table
ALTER TABLE public.meeting_choices ADD COLUMN IF NOT EXISTS group_id integer;

-- Create unique index to prevent duplicate choices per group
CREATE UNIQUE INDEX IF NOT EXISTS meeting_choices_unique
ON public.meeting_choices (poll_id, user_id, slot_id, group_id);

-- Drop existing RLS policies for meeting_choices
DROP POLICY IF EXISTS "Users can view group member choices" ON public.meeting_choices;
DROP POLICY IF EXISTS "Users can insert their own choices" ON public.meeting_choices;
DROP POLICY IF EXISTS "Users can update their own choices" ON public.meeting_choices;
DROP POLICY IF EXISTS "Users can delete their own choices" ON public.meeting_choices;

-- Create new RLS policies for group-scoped access
CREATE POLICY "select same group" ON public.meeting_choices
FOR SELECT USING ( 
  group_id IN (
    SELECT group_id 
    FROM public.meeting_choices mc 
    WHERE mc.user_id = auth.uid()
  ) OR user_id = auth.uid() 
);

CREATE POLICY "insert own row" ON public.meeting_choices
FOR INSERT WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "delete own row" ON public.meeting_choices
FOR DELETE USING ( user_id = auth.uid() );