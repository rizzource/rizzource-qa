-- Add outline preference field to mentors table
ALTER TABLE public.mentors ADD COLUMN outline_preference text;

-- Update existing records to have a default value
UPDATE public.mentors SET outline_preference = 'upload' WHERE outline_preference IS NULL;