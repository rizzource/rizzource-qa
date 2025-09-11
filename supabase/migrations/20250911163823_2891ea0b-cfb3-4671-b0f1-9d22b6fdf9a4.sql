-- 1) Helper to fetch user email from profiles (bypassing RLS safely)
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE id = _user_id;
$$;

-- 2) Drop existing policy and create new one with corrected name
DROP POLICY IF EXISTS "Users can view all choices in accessible polls" ON public.meeting_choices;
DROP POLICY IF EXISTS "Users can view choices from their group" ON public.meeting_choices;
CREATE POLICY "Users can view group member choices"
ON public.meeting_choices
FOR SELECT
USING (
  public.get_user_email(user_id) = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'::text))
);

-- 3) Make get_choice_tallies group-aware (SECURITY DEFINER bypasses RLS, so filter explicitly)
CREATE OR REPLACE FUNCTION public.get_choice_tallies(poll_id_param uuid)
RETURNS TABLE(slot_id uuid, date date, start_time text, end_time text, choice_count integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    s.id as slot_id,
    s.date,
    s.start_time,
    s.end_time,
    COALESCE(COUNT(c.id), 0)::INTEGER as choice_count
  FROM public.meeting_slots s
  LEFT JOIN public.meeting_choices c 
    ON s.id = c.slot_id
   AND public.get_user_email(c.user_id) = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'::text))
  WHERE s.poll_id = poll_id_param
  GROUP BY s.id, s.date, s.start_time, s.end_time
  ORDER BY 
    choice_count DESC,
    s.date ASC,
    s.start_time ASC;
$function$;