-- Function to check if user has a specific role in a company
CREATE OR REPLACE FUNCTION public.has_company_role(_company_id uuid, _user_id uuid, _role app_role)
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
      AND role = _role
  )
$$;

-- Function to get user's role in a company
CREATE OR REPLACE FUNCTION public.get_user_company_role(_company_id uuid, _user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.company_members
  WHERE company_id = _company_id AND user_id = _user_id
  LIMIT 1
$$;