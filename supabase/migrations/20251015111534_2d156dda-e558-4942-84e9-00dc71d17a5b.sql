-- Add company_id column to job_applications table
ALTER TABLE public.job_applications 
ADD COLUMN company_id uuid;

-- Backfill company_id from jobs table for existing records
UPDATE public.job_applications 
SET company_id = jobs.company_id 
FROM public.jobs 
WHERE job_applications.job_id = jobs.id;

-- Add foreign key constraint
ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Make company_id NOT NULL after backfilling
ALTER TABLE public.job_applications 
ALTER COLUMN company_id SET NOT NULL;