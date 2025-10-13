-- Fix RLS for meeting tables that were missing it
ALTER TABLE public.meeting_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_slots ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.meeting_votes ENABLE ROW LEVEL SECURITY;