-- Fix security issues by enabling RLS on existing tables and setting proper search paths

-- Enable RLS on existing tables that don't have it
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.mentees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.update_outline_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the outline's rating stats
  UPDATE public.outlines 
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.outline_ratings 
      WHERE outline_id = COALESCE(NEW.outline_id, OLD.outline_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.outline_ratings 
      WHERE outline_id = COALESCE(NEW.outline_id, OLD.outline_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.outline_id, OLD.outline_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_outline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;