-- Drop the unique constraint to allow multiple choices per user
ALTER TABLE public.meeting_choices DROP CONSTRAINT meeting_choices_poll_user_unique;

-- Add a new unique constraint on poll_id, user_id, and slot_id to prevent duplicate votes on same slot
ALTER TABLE public.meeting_choices ADD CONSTRAINT meeting_choices_poll_user_slot_unique UNIQUE(poll_id, user_id, slot_id);

-- Update the function to get choice tallies (no changes needed, it already counts correctly)
-- But let's add a function to get user's choices
CREATE OR REPLACE FUNCTION public.get_user_choices(poll_id_param UUID, user_id_param UUID)
RETURNS TABLE(slot_id UUID)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.slot_id
  FROM public.meeting_choices c
  WHERE c.poll_id = poll_id_param 
    AND c.user_id = user_id_param;
$$;