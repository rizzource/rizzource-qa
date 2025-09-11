-- First, let's update existing records to have proper group_id values
-- We'll use the email-based grouping to determine the correct group_id

-- Update existing records where group_id is null
-- Group 17: saad@gmail.com and salaar@gmail.com  
UPDATE public.meeting_choices 
SET group_id = 17
WHERE group_id IS NULL 
  AND user_id IN (
    SELECT id FROM public.profiles 
    WHERE email IN ('saad@gmail.com', 'salaar@gmail.com')
  );

-- Fix the RLS policy to handle cases where users might not have existing records
DROP POLICY IF EXISTS "Users can view choices in their group" ON public.meeting_choices;

-- Create a better policy that works with both existing users and new users
CREATE POLICY "Users can view choices in their group"
ON public.meeting_choices
FOR SELECT
USING (
  -- Allow users to see their own choices
  user_id = auth.uid()
  OR
  -- Allow users to see choices from others in their group (if they have a group_id)
  (group_id IS NOT NULL AND group_id = (
    SELECT group_id 
    FROM public.meeting_choices 
    WHERE user_id = auth.uid() 
    AND group_id IS NOT NULL
    LIMIT 1
  ))
);