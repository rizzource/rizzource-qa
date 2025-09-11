import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const useBestChoice = (pollId) => {
  const { user } = useAuth();
  const [userChoices, setUserChoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserChoices = useCallback(async () => {
    if (!pollId || !user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_choices', { 
          poll_id_param: pollId, 
          user_id_param: user.id 
        });

      if (error) throw error;
      setUserChoices(data?.map(item => item.slot_id) || []);
    } catch (error) {
      console.error('Error fetching user choices:', error);
      toast.error('Failed to fetch your choices');
    } finally {
      setLoading(false);
    }
  }, [pollId, user?.id]);

  const toggleSlotChoice = useCallback(async (slotId) => {
    if (!user || !pollId) return;

    const isCurrentlySelected = userChoices.includes(slotId);
    
    // Optimistic update
    setUserChoices(prev => 
      isCurrentlySelected 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );

    try {
      if (isCurrentlySelected) {
        // Remove choice
        const { error } = await supabase
          .from('meeting_choices')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .eq('slot_id', slotId);

        if (error) throw error;
      } else {
        // Add choice
        const { error } = await supabase
          .from('meeting_choices')
          .insert({
            poll_id: pollId,
            user_id: user.id,
            slot_id: slotId
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling choice:', error);
      toast.error('Failed to update your choice');
      // Revert optimistic update
      await fetchUserChoices();
    }
  }, [user, pollId, userChoices, fetchUserChoices]);

  const clearAllChoices = useCallback(async () => {
    if (!user || !pollId) return;

    // Optimistic update
    setUserChoices([]);

    try {
      const { error } = await supabase
        .from('meeting_choices')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing choices:', error);
      toast.error('Failed to clear your choices');
      // Revert optimistic update
      await fetchUserChoices();
    }
  }, [user, pollId, fetchUserChoices]);

  useEffect(() => {
    if (user && pollId) {
      fetchUserChoices();
    }
  }, [user, pollId, fetchUserChoices]);

  return {
    userChoices,
    loading,
    toggleSlotChoice,
    clearAllChoices,
    refetch: fetchUserChoices
  };
};