-- Drop policies that depend on owner_id
DROP POLICY IF EXISTS "Owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can delete their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Owners can manage their team" ON public.company_members;

-- Remove the owner_id column
ALTER TABLE public.companies DROP COLUMN IF EXISTS owner_id;

-- Add owner_name and owner_email columns
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS owner_name text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS owner_email text;

-- Recreate policies without owner_id dependency
CREATE POLICY "Company members with owner role can update companies" 
ON public.companies 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = companies.id 
    AND company_members.user_id = auth.uid() 
    AND company_members.role = 'owner'
  )
);

CREATE POLICY "Company members with owner role can delete jobs" 
ON public.jobs 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members 
    WHERE company_members.company_id = jobs.company_id 
    AND company_members.user_id = auth.uid() 
    AND company_members.role = 'owner'
  )
);

CREATE POLICY "Company owners can manage their team" 
ON public.company_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.company_members cm 
    WHERE cm.company_id = company_members.company_id 
    AND cm.user_id = auth.uid() 
    AND cm.role = 'owner'
  )
);