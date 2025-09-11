-- Ensure users in the same group can view each other's choices via existing RLS
-- Update static group mapping to include saad & salaar in the same group

CREATE OR REPLACE FUNCTION public.get_group_member_emails(user_email text)
 RETURNS text[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- Group 15 (example group)
  ELSIF user_email IN ('iqra@gmail.com', 'uneeb@gmail.com', 'fahad@gmail.com', 'fahadurrehman@gmail.com') THEN
    group_emails := ARRAY['iqra@gmail.com', 'uneeb@gmail.com', 'fahad@gmail.com', 'fahadurrehman@gmail.com'];
  -- New Group: saad & salaar
  ELSIF user_email IN ('saad@gmail.com', 'salaar@gmail.com') THEN
    group_emails := ARRAY['saad@gmail.com', 'salaar@gmail.com'];
  END IF;
  
  RETURN group_emails;
END;
$function$;
