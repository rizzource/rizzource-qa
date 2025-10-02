-- Create a security definer function to get user's group_id without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_group_id()
RETURNS INTEGER AS $$
DECLARE
  user_group_id INTEGER;
BEGIN
  SELECT group_id INTO user_group_id 
  FROM public.meeting_choices 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  RETURN user_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "select same group" ON public.meeting_choices;
DROP POLICY IF EXISTS "insert own row" ON public.meeting_choices;
DROP POLICY IF EXISTS "delete own row" ON public.meeting_choices;

-- Create new policies that don't cause infinite recursion
CREATE POLICY "Users can view their own choices" ON public.meeting_choices
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view same group choices" ON public.meeting_choices
FOR SELECT USING (group_id = public.get_user_group_id());

CREATE POLICY "Users can insert their own choices" ON public.meeting_choices
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own choices" ON public.meeting_choices
FOR DELETE USING (user_id = auth.uid());