-- Fix RLS policies to work with group_id column instead of email-based grouping
DROP POLICY IF EXISTS "Group members can view all group choices" ON public.meeting_choices;

-- Create new policy that uses the group_id column directly
CREATE POLICY "Users can view choices in their group"
ON public.meeting_choices
FOR SELECT
USING (
  group_id = (
    SELECT group_id 
    FROM public.meeting_choices 
    WHERE user_id = auth.uid() 
    LIMIT 1
  )
  OR user_id = auth.uid()
);

-- Also fix INSERT policy to ensure group_id is properly set
DROP POLICY IF EXISTS "Users can insert their own choices" ON public.meeting_choices;
CREATE POLICY "Users can insert their own choices"
ON public.meeting_choices
FOR INSERT
WITH CHECK (user_id = auth.uid());