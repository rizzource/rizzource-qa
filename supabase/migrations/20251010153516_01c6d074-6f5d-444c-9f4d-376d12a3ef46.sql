-- Update is_company_owner function with proper enum casting
CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE company_id = _company_id 
      AND user_id = _user_id 
      AND role = 'owner'::app_role
  )
$$;