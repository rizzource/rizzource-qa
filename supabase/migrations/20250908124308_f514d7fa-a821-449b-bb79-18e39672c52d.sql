-- Add meetup preference columns to mentors table
ALTER TABLE public.mentors 
ADD COLUMN meetup_how TEXT,
ADD COLUMN meetup_when TEXT;