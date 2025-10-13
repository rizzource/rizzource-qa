-- Create meeting_choices table for single best time selection
CREATE TABLE public.meeting_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.meeting_polls(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.meeting_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT meeting_choices_poll_user_unique UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.meeting_choices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all choices in accessible polls" 
ON public.meeting_choices 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own choices" 
ON public.meeting_choices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own choices" 
ON public.meeting_choices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own choices" 
ON public.meeting_choices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to get choice tallies for a poll
CREATE OR REPLACE FUNCTION public.get_choice_tallies(poll_id_param UUID)
RETURNS TABLE(
  slot_id UUID, 
  date DATE, 
  start_time TEXT, 
  end_time TEXT, 
  choice_count INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id as slot_id,
    s.date,
    s.start_time,
    s.end_time,
    COALESCE(COUNT(c.id), 0)::INTEGER as choice_count
  FROM public.meeting_slots s
  LEFT JOIN public.meeting_choices c ON s.id = c.slot_id
  WHERE s.poll_id = poll_id_param
  GROUP BY s.id, s.date, s.start_time, s.end_time
  ORDER BY 
    choice_count DESC,
    s.date ASC,
    s.start_time ASC;
$$;