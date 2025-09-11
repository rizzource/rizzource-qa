-- Enable RLS on tables that have policies but RLS is disabled
ALTER TABLE public.meeting_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_votes ENABLE ROW LEVEL SECURITY;