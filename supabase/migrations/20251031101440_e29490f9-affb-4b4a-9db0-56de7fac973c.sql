-- Add resume fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS resume_file_name TEXT,
ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster resume lookups
CREATE INDEX IF NOT EXISTS idx_profiles_resume ON public.profiles(id) WHERE resume_url IS NOT NULL;