-- Fix recursive RLS policy on meeting_choices causing 42P17 errors
-- 1) Drop the problematic policy
DROP POLICY IF EXISTS "Users can view choices in their group" ON public.meeting_choices;

-- 2) Create a non-recursive policy leveraging helper functions
--    - Users can always see their own rows
--    - Users can see rows where the row's user belongs to the same static group (via email mapping)
CREATE POLICY "Users can view choices in their group" 
ON public.meeting_choices
FOR SELECT
USING (
  auth.uid() = user_id
  OR public.get_user_email(user_id) = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'::text))
);

-- Notes:
-- - This avoids referencing meeting_choices within the policy body, preventing infinite recursion
-- - Depends on existing functions: public.get_user_email(uuid) and public.get_group_member_emails(text)
