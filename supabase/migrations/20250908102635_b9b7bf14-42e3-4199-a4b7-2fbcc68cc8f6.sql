-- Add hadUploadedOutline field to mentors table
ALTER TABLE public.mentors ADD COLUMN had_uploaded_outline BOOLEAN DEFAULT FALSE;

-- Add email field to outlines table to track which mentor uploaded
ALTER TABLE public.outlines ADD COLUMN mentor_email TEXT;