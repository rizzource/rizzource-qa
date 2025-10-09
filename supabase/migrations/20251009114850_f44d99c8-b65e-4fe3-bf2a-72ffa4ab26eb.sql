-- Fix RLS policy for company_members to allow superadmins to insert
DROP POLICY IF EXISTS "Owners can manage their team" ON public.company_members;

CREATE POLICY "Owners can manage their team"
ON public.company_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_members.company_id
    AND companies.owner_id = auth.uid()
  )
);

-- Add policy for superadmins to manage company_members
CREATE POLICY "Superadmins can manage company members"
ON public.company_members
FOR ALL
USING (public.is_superadmin())
WITH CHECK (public.is_superadmin());

-- Add foreign key for owner_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'companies_owner_id_fkey'
  ) THEN
    ALTER TABLE public.companies
    ADD CONSTRAINT companies_owner_id_fkey 
    FOREIGN KEY (owner_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
  END IF;
END $$;