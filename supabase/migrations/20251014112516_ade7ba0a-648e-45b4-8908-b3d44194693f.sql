-- Add email column to company_members table
ALTER TABLE public.company_members 
ADD COLUMN email TEXT;

-- Backfill email from profiles table for existing records
UPDATE public.company_members cm
SET email = p.email
FROM public.profiles p
WHERE cm.user_id = p.id;

-- Make email NOT NULL after backfilling
ALTER TABLE public.company_members 
ALTER COLUMN email SET NOT NULL;