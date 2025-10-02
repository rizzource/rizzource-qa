-- Update seed function to use 2025 dates and extend times to 21:00
CREATE OR REPLACE FUNCTION public.seed_fixed_poll()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poll_id uuid;
  slot_date date;
  current_hour integer;
  start_time_str text;
  end_time_str text;
BEGIN
  -- Create the poll
  INSERT INTO public.meeting_polls (title, group_id)
  VALUES ('September 11-21 Availability Poll', gen_random_uuid())
  RETURNING id INTO poll_id;
  
  -- Generate slots for Sept 11-21, 09:00-21:00 (2025 dates)
  FOR i IN 11..21 LOOP
    slot_date := ('2025-09-' || i::text)::date;
    
    FOR current_hour IN 9..21 LOOP
      start_time_str := LPAD(current_hour::text, 2, '0') || ':00';
      end_time_str := LPAD((current_hour + 1)::text, 2, '0') || ':00';
      
      INSERT INTO public.meeting_slots (poll_id, date, start_time, end_time)
      VALUES (poll_id, slot_date, start_time_str, end_time_str);
    END LOOP;
  END LOOP;
  
  RETURN poll_id;
END;
$$;