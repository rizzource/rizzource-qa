import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const useBestChoice = (pollId) => {
  const { user, groupId } = useAuth();
  const [userChoices, setUserChoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserChoices = useCallback(async () => {
    if (!pollId || !user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_choices')
        .select('slot_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

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
    if (!user?.id || !pollId) return;

    const isCurrentlySelected = userChoices.includes(slotId);
    
    // Optimistic update
    setUserChoices(prev => 
      isCurrentlySelected 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );

    try {
      if (isCurrentlySelected) {
        // Remove choice - let RLS handle the filtering
        const { error } = await supabase
          .from('meeting_choices')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .eq('slot_id', slotId);

        if (error) throw error;
      } else {
        // Add choice with upsert to handle duplicates
        const { error } = await supabase
          .from('meeting_choices')
          .upsert({
            poll_id: pollId,
            user_id: user.id,
            slot_id: slotId,
            group_id: groupId
          }, {
            onConflict: 'poll_id,user_id,slot_id'
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling choice:', error);
      toast.error('Failed to update your choice');
      // Revert optimistic update
      await fetchUserChoices();
    }
  }, [user?.id, pollId, groupId, userChoices, fetchUserChoices]);

  const clearAllChoices = useCallback(async () => {
    if (!user?.id || !pollId) return;

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
  }, [user?.id, pollId, fetchUserChoices]);

  useEffect(() => {
    if (user?.id && pollId) {
      fetchUserChoices();
    }
  }, [user?.id, pollId, fetchUserChoices]);

  // Set up realtime subscription for group changes
  useEffect(() => {
    if (!pollId) return;

    const channel = supabase
      .channel('meeting_choices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meeting_choices',
        filter: `poll_id=eq.${pollId}`
      }, (payload) => {
        const row = payload.new || payload.old;
        // Refresh user choices if it's the current user's action
        if (row?.user_id === user?.id) {
          fetchUserChoices();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, user?.id, fetchUserChoices]);

  return {
    userChoices,
    loading,
    toggleSlotChoice,
    clearAllChoices,
    refetch: fetchUserChoices
  };
};