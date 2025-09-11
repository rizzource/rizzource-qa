-- Enable RLS on remaining public tables to fix security warnings
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.scheduling_responses ENABLE ROW LEVEL SECURITY;