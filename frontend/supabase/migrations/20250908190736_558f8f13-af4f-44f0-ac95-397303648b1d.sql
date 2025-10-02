-- Create scheduling_responses table to store the new unified form data
CREATE TABLE public.scheduling_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('mentor', 'mentee')),
  date_type TEXT NOT NULL CHECK (date_type IN ('days', 'specific')),
  selected_days TEXT[],
  selected_dates DATE[],
  earliest_time TEXT NOT NULL,
  latest_time TEXT NOT NULL,
  activities TEXT[] NOT NULL,
  mentor_options TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduling_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduling responses
CREATE POLICY "Anyone can insert scheduling responses" 
ON public.scheduling_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own scheduling responses" 
ON public.scheduling_responses 
FOR SELECT 
USING (email = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Admins can view all scheduling responses" 
ON public.scheduling_responses 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update scheduling responses" 
ON public.scheduling_responses 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete scheduling responses" 
ON public.scheduling_responses 
FOR DELETE 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduling_responses_updated_at
BEFORE UPDATE ON public.scheduling_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();