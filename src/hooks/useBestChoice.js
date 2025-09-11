import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const useBestChoice = (pollId) => {
  const { user, groupId } = useAuth();
  const [userChoices, setUserChoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserChoices = useCallback(async () => {
    if (!pollId || !user?.id || groupId === null) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_choices')
        .select('slot_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      if (error) throw error;
      setUserChoices(data?.map(item => item.slot_id) || []);
    } catch (error) {
      console.error('Error fetching user choices:', error);
      toast.error('Failed to fetch your choices');
    } finally {
      setLoading(false);
    }
  }, [pollId, user?.id, groupId]);

  const toggleSlotChoice = useCallback(async (slotId) => {
    if (!user?.id || !pollId || groupId === null) return;

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
          .eq('group_id', groupId)
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
            onConflict: 'poll_id,user_id,slot_id,group_id'
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
    if (!user?.id || !pollId || groupId === null) return;

    // Optimistic update
    setUserChoices([]);

    try {
      const { error } = await supabase
        .from('meeting_choices')
        .delete()
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing choices:', error);
      toast.error('Failed to clear your choices');
      // Revert optimistic update
      await fetchUserChoices();
    }
  }, [user?.id, pollId, groupId, fetchUserChoices]);

  useEffect(() => {
    if (user?.id && pollId && groupId !== null) {
      fetchUserChoices();
    }
  }, [user?.id, pollId, groupId, fetchUserChoices]);

  // Set up realtime subscription for group changes
  useEffect(() => {
    if (!pollId || groupId === null) return;

    const channel = supabase
      .channel('meeting_choices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meeting_choices',
        filter: `poll_id=eq.${pollId}`
      }, (payload) => {
        const row = payload.new || payload.old;
        if (row?.group_id === groupId) {
          // Refresh user choices if it's the current user's action
          if (row?.user_id === user?.id) {
            fetchUserChoices();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, groupId, user?.id, fetchUserChoices]);

  return {
    userChoices,
    loading,
    toggleSlotChoice,
    clearAllChoices,
    refetch: fetchUserChoices
  };
};