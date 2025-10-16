-- Add company_name column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN company_name TEXT;