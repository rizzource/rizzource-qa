import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const useBestChoice = (pollId) => {
  const { user } = useAuth();
  const [userChoice, setUserChoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserChoice = useCallback(async () => {
    if (!pollId || !user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_choices')
        .select('slot_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserChoice(data?.slot_id || null);
    } catch (error) {
      console.error('Error fetching user choice:', error);
      toast.error('Failed to fetch your choice');
    } finally {
      setLoading(false);
    }
  }, [pollId, user?.id]);

  const selectBestTime = useCallback(async (slotId) => {
    if (!user || !pollId) return;

    // Optimistic update
    setUserChoice(slotId);

    try {
      const { error } = await supabase
        .from('meeting_choices')
        .upsert({
          poll_id: pollId,
          user_id: user.id,
          slot_id: slotId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving choice:', error);
      toast.error('Failed to save your choice');
      // Revert optimistic update
      await fetchUserChoice();
    }
  }, [user, pollId, fetchUserChoice]);

  const clearChoice = useCallback(async () => {
    if (!user || !pollId) return;

    // Optimistic update
    setUserChoice(null);

    try {
      const { error } = await supabase
        .from('meeting_choices')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing choice:', error);
      toast.error('Failed to clear your choice');
      // Revert optimistic update
      await fetchUserChoice();
    }
  }, [user, pollId, fetchUserChoice]);

  useEffect(() => {
    if (user && pollId) {
      fetchUserChoice();
    }
  }, [user, pollId, fetchUserChoice]);

  return {
    userChoice,
    loading,
    selectBestTime,
    clearChoice,
    refetch: fetchUserChoice
  };
};