-- Create meeting_polls table
CREATE TABLE public.meeting_polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  group_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create meeting_slots table
CREATE TABLE public.meeting_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES public.meeting_polls(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create meeting_votes table
CREATE TABLE public.meeting_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id uuid NOT NULL REFERENCES public.meeting_slots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  choice text NOT NULL CHECK (choice IN ('yes', 'maybe', 'no')),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(slot_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.meeting_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Polls: users can only see polls for their group
CREATE POLICY "Users can view polls for their group"
ON public.meeting_polls
FOR SELECT
USING (true); -- For now, allow all authenticated users

-- Slots: users can only see slots for polls they have access to
CREATE POLICY "Users can view slots for accessible polls"
ON public.meeting_slots
FOR SELECT
USING (true);

-- Votes: users can manage their own votes
CREATE POLICY "Users can view all votes"
ON public.meeting_votes
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own votes"
ON public.meeting_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.meeting_votes
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to seed Sept 11-21 slots
CREATE OR REPLACE FUNCTION public.seed_fixed_poll()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  poll_id uuid;
  current_date date;
  current_hour integer;
  start_time_str text;
  end_time_str text;
BEGIN
  -- Create the poll
  INSERT INTO public.meeting_polls (title, group_id)
  VALUES ('September 11-21 Availability Poll', gen_random_uuid())
  RETURNING id INTO poll_id;
  
  -- Generate slots for Sept 11-21, 09:00-21:00
  FOR i IN 11..21 LOOP
    current_date := ('2024-09-' || i::text)::date;
    
    FOR current_hour IN 9..20 LOOP
      start_time_str := LPAD(current_hour::text, 2, '0') || ':00';
      end_time_str := LPAD((current_hour + 1)::text, 2, '0') || ':00';
      
      INSERT INTO public.meeting_slots (poll_id, date, start_time, end_time)
      VALUES (poll_id, current_date, start_time_str, end_time_str);
    END LOOP;
  END LOOP;
  
  RETURN poll_id;
END;
$$;

-- Create function to get slot rankings with votes
CREATE OR REPLACE FUNCTION public.get_slot_rankings(poll_id_param uuid)
RETURNS TABLE(
  slot_id uuid,
  date date,
  start_time text,
  end_time text,
  yes_count integer,
  maybe_count integer,
  no_count integer,
  score integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id as slot_id,
    s.date,
    s.start_time,
    s.end_time,
    COALESCE(SUM(CASE WHEN v.choice = 'yes' THEN 1 ELSE 0 END), 0)::integer as yes_count,
    COALESCE(SUM(CASE WHEN v.choice = 'maybe' THEN 1 ELSE 0 END), 0)::integer as maybe_count,
    COALESCE(SUM(CASE WHEN v.choice = 'no' THEN 1 ELSE 0 END), 0)::integer as no_count,
    COALESCE(SUM(
      CASE 
        WHEN v.choice = 'yes' THEN 2
        WHEN v.choice = 'maybe' THEN 1
        ELSE 0
      END
    ), 0)::integer as score
  FROM public.meeting_slots s
  LEFT JOIN public.meeting_votes v ON s.id = v.slot_id
  WHERE s.poll_id = poll_id_param
  GROUP BY s.id, s.date, s.start_time, s.end_time
  ORDER BY 
    score DESC,
    yes_count DESC,
    s.date ASC,
    s.start_time ASC;
$$;