-- Create security definer function to check if user is company owner
CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE company_id = _company_id 
      AND user_id = _user_id 
      AND role = 'owner'
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Company owners can manage their team" ON public.company_members;

-- Recreate it using the security definer function
CREATE POLICY "Company owners can manage their team"
ON public.company_members
FOR ALL
USING (public.is_company_owner(company_id, auth.uid()))
WITH CHECK (public.is_company_owner(company_id, auth.uid()));