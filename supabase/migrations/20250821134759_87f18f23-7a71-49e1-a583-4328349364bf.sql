-- Create mentors table
CREATE TABLE public.mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  class_year TEXT NOT NULL,
  field_of_law TEXT NOT NULL,
  hometown TEXT NOT NULL,
  undergraduate_university TEXT NOT NULL,
  hobbies TEXT,
  mentorship_time_commitment TEXT NOT NULL,
  car_availability BOOLEAN DEFAULT false,
  co_mentor_preference TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentees table
CREATE TABLE public.mentees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  field_of_law TEXT NOT NULL,
  hometown TEXT NOT NULL,
  undergraduate_university TEXT NOT NULL,
  hobbies TEXT,
  expectations TEXT,
  car_availability BOOLEAN DEFAULT false,
  mentorship_time_commitment TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  application_experience TEXT NOT NULL,
  experience_rating TEXT NOT NULL CHECK (experience_rating IN ('Excellent', 'Good', 'Average', 'Poor')),
  liked_about_process TEXT,
  thoughts TEXT,
  suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) - allowing public access for this use case
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required for this application)
CREATE POLICY "Allow public insert on mentors" ON public.mentors
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on mentees" ON public.mentees
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on feedback" ON public.feedback
FOR INSERT WITH CHECK (true);

-- Optional: Allow reading for admin purposes (you can modify this later)
CREATE POLICY "Allow public read on mentors" ON public.mentors
FOR SELECT USING (true);

CREATE POLICY "Allow public read on mentees" ON public.mentees
FOR SELECT USING (true);

CREATE POLICY "Allow public read on feedback" ON public.feedback
FOR SELECT USING (true);