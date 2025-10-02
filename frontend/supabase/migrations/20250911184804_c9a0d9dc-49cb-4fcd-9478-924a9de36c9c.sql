-- Drop conflicting policies and create single correct policy for each operation
DROP POLICY IF EXISTS "Group members can view group choices" ON public.meeting_choices;
DROP POLICY IF EXISTS "Users can view same group choices" ON public.meeting_choices;
DROP POLICY IF EXISTS "Users can view their own choices" ON public.meeting_choices;

-- Create single SELECT policy that allows group members to see all group choices
CREATE POLICY "Group members can view all group choices"
ON public.meeting_choices
FOR SELECT
USING (
  public.get_user_email(user_id) = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'))
);

-- Keep existing INSERT policy
-- CREATE POLICY "Users can insert their own choices" already exists

-- Keep existing DELETE policy  
-- CREATE POLICY "Users can delete their own choices" already exists

-- Add missing UPDATE policy for upserts
DROP POLICY IF EXISTS "Users can update their own choices" ON public.meeting_choices;
CREATE POLICY "Users can update their own choices"
ON public.meeting_choices
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());