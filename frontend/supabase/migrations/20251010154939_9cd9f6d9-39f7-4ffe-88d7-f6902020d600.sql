-- Allow 'employee' in company_members.role check constraint
ALTER TABLE public.company_members DROP CONSTRAINT IF EXISTS company_members_role_check;
ALTER TABLE public.company_members
  ADD CONSTRAINT company_members_role_check
  CHECK (role = ANY (ARRAY['owner'::app_role, 'hr'::app_role, 'admin'::app_role, 'employee'::app_role]));