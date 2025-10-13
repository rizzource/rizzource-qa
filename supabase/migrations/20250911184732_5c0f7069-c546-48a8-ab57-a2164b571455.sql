-- Fix RLS so group members can view choices even if they haven't made any yet
-- Ensure RLS is enabled
ALTER TABLE public.meeting_choices ENABLE ROW LEVEL SECURITY;

-- Allow group-based visibility: a user can see choices made by anyone whose email is in the same group as theirs
CREATE POLICY IF NOT EXISTS "Group members can view group choices"
ON public.meeting_choices
FOR SELECT
USING (
  public.get_user_email(user_id) = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'))
);

-- Allow users to create their own choices
CREATE POLICY IF NOT EXISTS "Users can insert their own choices"
ON public.meeting_choices
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own choices (for upserts)
CREATE POLICY IF NOT EXISTS "Users can update their own choices"
ON public.meeting_choices
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own choices
CREATE POLICY IF NOT EXISTS "Users can delete their own choices"
ON public.meeting_choices
FOR DELETE
USING (user_id = auth.uid());