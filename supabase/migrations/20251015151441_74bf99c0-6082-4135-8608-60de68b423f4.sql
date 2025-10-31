-- Add area_of_law column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN area_of_law TEXT;

-- Update dummy jobs with area of law data
UPDATE public.jobs 
SET area_of_law = 'Corporate Law'
WHERE title = 'Senior Legal Counsel';

UPDATE public.jobs 
SET area_of_law = 'Litigation'
WHERE title = 'Associate Attorney';

UPDATE public.jobs 
SET area_of_law = 'Immigration Law'
WHERE title = 'Immigration Paralegal';