-- SECURE THE EXISTING TABLES - Remove dangerous public policies and add secure ones

-- Drop existing dangerous public policies
DROP POLICY IF EXISTS "Allow public insert on feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow public read on feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow public insert on mentees" ON public.mentees;
DROP POLICY IF EXISTS "Allow public read on mentees" ON public.mentees;
DROP POLICY IF EXISTS "Allow public insert on mentors" ON public.mentors;
DROP POLICY IF EXISTS "Allow public read on mentors" ON public.mentors;

-- FEEDBACK TABLE - Secure policies
CREATE POLICY "Authenticated users can insert feedback" ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete feedback" ON public.feedback
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- MENTEES TABLE - Secure policies  
CREATE POLICY "Authenticated users can insert as mentee" ON public.mentees
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all mentees" ON public.mentees
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update mentees" ON public.mentees
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete mentees" ON public.mentees
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- MENTORS TABLE - Secure policies
CREATE POLICY "Authenticated users can insert as mentor" ON public.mentors
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all mentors" ON public.mentors
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update mentors" ON public.mentors
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete mentors" ON public.mentors
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Create audit log table for tracking data access
CREATE TABLE public.data_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  record_count INTEGER,
  notes TEXT
);

ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage export logs" ON public.data_exports
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Create function to safely export data
CREATE OR REPLACE FUNCTION public.export_data_to_json(table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  result JSON;
  record_count INTEGER := 0;
BEGIN
  -- Only allow admins to export
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required for data export.';
  END IF;
  
  -- Export based on table name
  CASE table_name
    WHEN 'mentees' THEN
      SELECT json_agg(row_to_json(t)) INTO result
      FROM (SELECT * FROM public.mentees ORDER BY created_at DESC) t;
      
      SELECT COUNT(*) INTO record_count FROM public.mentees;
      
    WHEN 'mentors' THEN
      SELECT json_agg(row_to_json(t)) INTO result
      FROM (SELECT * FROM public.mentors ORDER BY created_at DESC) t;
      
      SELECT COUNT(*) INTO record_count FROM public.mentors;
      
    WHEN 'feedback' THEN
      SELECT json_agg(row_to_json(t)) INTO result
      FROM (SELECT * FROM public.feedback ORDER BY created_at DESC) t;
      
      SELECT COUNT(*) INTO record_count FROM public.feedback;
      
    ELSE
      RAISE EXCEPTION 'Invalid table name: %', table_name;
  END CASE;
  
  -- Log the export
  INSERT INTO public.data_exports (user_id, export_type, record_count)
  VALUES (auth.uid(), table_name, record_count);
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;