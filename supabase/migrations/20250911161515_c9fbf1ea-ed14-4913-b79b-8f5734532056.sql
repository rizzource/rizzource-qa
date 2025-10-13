-- Create a function to get group member emails for a given user email
CREATE OR REPLACE FUNCTION public.get_group_member_emails(user_email text)
RETURNS text[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  group_emails text[] := ARRAY[]::text[];
BEGIN
  -- Group 1
  IF user_email IN ('kntang@emory.edu', 'cnam7@emory.edu', 'rhliu@emory.edu', 'chua277@emory.edu') THEN
    group_emails := ARRAY['kntang@emory.edu', 'cnam7@emory.edu', 'rhliu@emory.edu', 'chua277@emory.edu'];
  -- Group 2  
  ELSIF user_email IN ('susie.warner@emory.edu', 'jaime.wu@emory.edu', 'syou35@emory.edu', 'yena.kang@emory.edu') THEN
    group_emails := ARRAY['susie.warner@emory.edu', 'jaime.wu@emory.edu', 'syou35@emory.edu', 'yena.kang@emory.edu'];
  -- Group 3
  ELSIF user_email IN ('alexis.nguyen@emory.edu', 'jcflore@emory.edu', 'helen.huang@emory.edu', 'hans.khoe@emory.edu') THEN
    group_emails := ARRAY['alexis.nguyen@emory.edu', 'jcflore@emory.edu', 'helen.huang@emory.edu', 'hans.khoe@emory.edu'];
  -- Group 4
  ELSIF user_email IN ('jdchun3@emory.edu', 'Jch2569@emory.edu', 'rose.nguyen@emory.edu', 'vu-anh.nguyen@emory.edu') THEN
    group_emails := ARRAY['jdchun3@emory.edu', 'Jch2569@emory.edu', 'rose.nguyen@emory.edu', 'vu-anh.nguyen@emory.edu'];
  -- Group 5
  ELSIF user_email IN ('sseo25@emory.edu', 'sharon.mun@emory.edu', '', 'han.gao@emory.edu') THEN
    group_emails := ARRAY['sseo25@emory.edu', 'sharon.mun@emory.edu', 'han.gao@emory.edu'];
  -- Group 6
  ELSIF user_email IN ('sangjee.hahn@emory.edu', 'jryu49@emory.edu', 'rkhan27@emory.edu', 'hjo34@emory.edu') THEN
    group_emails := ARRAY['sangjee.hahn@emory.edu', 'jryu49@emory.edu', 'rkhan27@emory.edu', 'hjo34@emory.edu'];
  -- Group 7
  ELSIF user_email IN ('daniel.choi2310@gmail.com', 'ga.yoon.choi@emory.edu', '', 'kyle.sung@emory.edu') THEN
    group_emails := ARRAY['daniel.choi2310@gmail.com', 'ga.yoon.choi@emory.edu', 'kyle.sung@emory.edu'];
  -- Group 8
  ELSIF user_email IN ('kent.tran@emory.edu', 'slin83@emory.edu', 'emma.barnes@emory.edu', 'grace.choi@emory.edu') THEN
    group_emails := ARRAY['kent.tran@emory.edu', 'slin83@emory.edu', 'emma.barnes@emory.edu', 'grace.choi@emory.edu'];
  -- Group 9
  ELSIF user_email IN ('kyungkeuk.kim@emory.edu', 'katherine.wang@emory.edu', 'jyoo299@emory.edu', 'kmun4@emory.edu') THEN
    group_emails := ARRAY['kyungkeuk.kim@emory.edu', 'katherine.wang@emory.edu', 'jyoo299@emory.edu', 'kmun4@emory.edu'];
  -- Group 10
  ELSIF user_email IN ('kathy.wei@emory.edu', 'moses.lim@emory.edu', 'Elly.ren@emory.edu', 'dkim726@emory.edu') THEN
    group_emails := ARRAY['kathy.wei@emory.edu', 'moses.lim@emory.edu', 'Elly.ren@emory.edu', 'dkim726@emory.edu'];
  -- Group 11
  ELSIF user_email IN ('connor.liang@emory.edu', 'eahn35@emory.edu', 'yliu992@emory.edu', 'mingjie.lin@emory.edu') THEN
    group_emails := ARRAY['connor.liang@emory.edu', 'eahn35@emory.edu', 'yliu992@emory.edu', 'mingjie.lin@emory.edu'];
  -- Group 12
  ELSIF user_email IN ('kyle.wang2@emory.edu', 'eric.oh@emory.edu', 'austin.liu@emory.edu', 'jdeo@emory.edu') THEN
    group_emails := ARRAY['kyle.wang2@emory.edu', 'eric.oh@emory.edu', 'austin.liu@emory.edu', 'jdeo@emory.edu'];
  -- Group 13
  ELSIF user_email IN ('heather.yang@emory.edu', 'lucy.chen@emory.edu', 'mki6@emory.edu', 'rachel.lo@emory.edu') THEN
    group_emails := ARRAY['heather.yang@emory.edu', 'lucy.chen@emory.edu', 'mki6@emory.edu', 'rachel.lo@emory.edu'];
  -- Group 14
  ELSIF user_email IN ('Quan.huynh@emory.edu', 'dyau2@emory.edu', 'ssunil3@emory.edu', 'addison.huang@emory.edu') THEN
    group_emails := ARRAY['Quan.huynh@emory.edu', 'dyau2@emory.edu', 'ssunil3@emory.edu', 'addison.huang@emory.edu'];
  -- Group 15 (the example group from the user)
  ELSIF user_email IN ('iqra@gmail.com', 'uneeb@gmail.com', 'fahad@gmail.com', 'fahadurrehman@gmail.com') THEN
    group_emails := ARRAY['iqra@gmail.com', 'uneeb@gmail.com', 'fahad@gmail.com', 'fahadurrehman@gmail.com'];
  END IF;
  
  RETURN group_emails;
END;
$$;

-- Update the RLS policy to only show availability from group members
DROP POLICY IF EXISTS "Users can view all availability slots" ON public.availability_slots;

CREATE POLICY "Users can view group availability slots" 
ON public.availability_slots 
FOR SELECT 
USING (user_email = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'::text)));

-- Update the heatmap function to only include group members
CREATE OR REPLACE FUNCTION public.get_availability_heatmap(target_date date)
 RETURNS TABLE(time_slot time without time zone, available_count integer, total_participants integer, availability_percentage numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    a.time_slot,
    COUNT(CASE WHEN a.is_available THEN 1 END)::INTEGER as available_count,
    COUNT(DISTINCT a.user_email)::INTEGER as total_participants,
    CASE 
      WHEN COUNT(DISTINCT a.user_email) > 0 
      THEN ROUND((COUNT(CASE WHEN a.is_available THEN 1 END)::NUMERIC / COUNT(DISTINCT a.user_email)::NUMERIC) * 100, 1)
      ELSE 0 
    END as availability_percentage
  FROM public.availability_slots a
  WHERE a.event_date = target_date
    AND a.user_email = ANY(public.get_group_member_emails(auth.jwt() ->> 'email'::text))
  GROUP BY a.time_slot
  ORDER BY a.time_slot;
$$;