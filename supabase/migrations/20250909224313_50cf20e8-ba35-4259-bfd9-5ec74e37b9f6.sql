-- Create table for detailed time slot availability
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  event_date DATE NOT NULL,
  time_slot TIME NOT NULL, -- 15-minute intervals: 09:00, 09:15, 09:30, etc.
  is_available BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all availability slots" 
ON public.availability_slots 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own availability" 
ON public.availability_slots 
FOR ALL
USING (user_email = (auth.jwt() ->> 'email'::text))
WITH CHECK (user_email = (auth.jwt() ->> 'email'::text));

-- Create indexes for better performance
CREATE INDEX idx_availability_date_time ON public.availability_slots(event_date, time_slot);
CREATE INDEX idx_availability_user_email ON public.availability_slots(user_email);
CREATE INDEX idx_availability_user_date ON public.availability_slots(user_email, event_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_availability_slots_updated_at
BEFORE UPDATE ON public.availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get availability heatmap data
CREATE OR REPLACE FUNCTION public.get_availability_heatmap(target_date DATE)
RETURNS TABLE (
  time_slot TIME,
  available_count INTEGER,
  total_participants INTEGER,
  availability_percentage NUMERIC
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    a.time_slot,
    COUNT(CASE WHEN a.is_available THEN 1 END)::INTEGER as available_count,
    COUNT(DISTINCT a.user_email)::INTEGER as total_participants,
    CASE 
      WHEN COUNT(DISTINCT a.user_email) > 0 
      THEN ROUND((COUNT(CASE WHEN a.is_available THEN 1 END)::NUMERIC / COUNT(DISTINCT a.user_email)::NUMERIC) * 100, 1)
      ELSE 0 
    END as availability_percentage
  FROM public.availability_slots a
  WHERE a.event_date = target_date
  GROUP BY a.time_slot
  ORDER BY a.time_slot;
$function$;