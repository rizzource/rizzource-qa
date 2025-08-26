-- Add policies for mentors to manage their own data
CREATE POLICY "Mentors can view their own data" 
ON public.mentors 
FOR SELECT 
TO authenticated
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Mentors can update their own data" 
ON public.mentors 
FOR UPDATE 
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Add policies for mentees to manage their own data  
CREATE POLICY "Mentees can view their own data" 
ON public.mentees 
FOR SELECT 
TO authenticated
USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Mentees can update their own data" 
ON public.mentees 
FOR UPDATE 
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Add policy for users to view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated
USING (user_email = auth.jwt() ->> 'email');