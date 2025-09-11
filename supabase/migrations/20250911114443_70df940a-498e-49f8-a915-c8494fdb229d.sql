-- Update existing poll data to use 2025 dates and add missing 21:00 slots

-- First, update all existing meeting_slots to use 2025 dates
UPDATE meeting_slots 
SET date = (date + INTERVAL '1 year')::date
WHERE poll_id IN (
  SELECT id FROM meeting_polls 
  WHERE title LIKE '%September%'
);

-- Add missing 21:00-22:00 time slots for each date
DO $$
DECLARE
  poll_record RECORD;
  slot_date date;
BEGIN
  -- Get the September poll
  SELECT * INTO poll_record FROM meeting_polls WHERE title LIKE '%September%' LIMIT 1;
  
  IF poll_record.id IS NOT NULL THEN
    -- Add 21:00-22:00 slots for each date from Sept 11-21, 2025
    FOR i IN 11..21 LOOP
      slot_date := ('2025-09-' || i::text)::date;
      
      -- Check if 21:00 slot already exists for this date
      IF NOT EXISTS (
        SELECT 1 FROM meeting_slots 
        WHERE poll_id = poll_record.id 
        AND date = slot_date 
        AND start_time = '21:00'
      ) THEN
        INSERT INTO meeting_slots (poll_id, date, start_time, end_time)
        VALUES (poll_record.id, slot_date, '21:00', '22:00');
      END IF;
    END LOOP;
  END IF;
END $$;