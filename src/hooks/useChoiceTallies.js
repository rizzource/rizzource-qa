import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const useChoiceTallies = (pollId) => {
  const { user, groupId } = useAuth();
  const [tallies, setTallies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupSize, setGroupSize] = useState(1);

  const fetchTallies = useCallback(async () => {
    if (!pollId || !groupId) return;
    
    try {
      setLoading(true);
      
      // Get choices from the same group only
      const { data: groupChoices, error: choicesError } = await supabase
        .from('meeting_choices')
        .select('slot_id, user_id')
        .eq('poll_id', pollId)
        .eq('group_id', groupId);

      if (choicesError) throw choicesError;

      // Aggregate counts in JS
      const slotCounts = {};
      groupChoices?.forEach(choice => {
        slotCounts[choice.slot_id] = (slotCounts[choice.slot_id] || 0) + 1;
      });

      // Get slot details
      const { data: slotsData, error: slotsError } = await supabase
        .from('meeting_slots')
        .select('id, date, start_time, end_time')
        .eq('poll_id', pollId);

      if (slotsError) throw slotsError;

      // Combine slot details with counts
      const talliesData = slotsData?.map(slot => ({
        slot_id: slot.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        choice_count: slotCounts[slot.id] || 0
      })) || [];

      // Get total group size (unique users who made any choice in this group)
      const uniqueUsers = new Set(groupChoices?.map(choice => choice.user_id) || []);
      setGroupSize(Math.max(uniqueUsers.size, 1));
      setTallies(talliesData);
    } catch (error) {
      console.error('Error fetching tallies:', error);
      toast.error('Failed to fetch choice tallies');
    } finally {
      setLoading(false);
    }
  }, [pollId, groupId]);

  // Memoized calculations
  const { topPicks, slotLookup, getIntensityColor } = useMemo(() => {
    const lookup = {};
    tallies.forEach(tally => {
      lookup[tally.slot_id] = tally;
    });

    const top5 = tallies
      .filter(t => t.choice_count > 0)
      .slice(0, 5);

    const getColor = (slotId) => {
      const tally = lookup[slotId];
      if (!tally || tally.choice_count === 0) return 'bg-muted/20';
      
      const intensity = Math.min(tally.choice_count / groupSize, 1);
      if (intensity >= 0.6) return 'bg-primary/60';
      if (intensity >= 0.4) return 'bg-primary/40';
      if (intensity >= 0.2) return 'bg-primary/20';
      return 'bg-primary/10';
    };

    return {
      topPicks: top5,
      slotLookup: lookup,
      getIntensityColor: getColor
    };
  }, [tallies, groupSize]);

  // Realtime subscription for group tallies
  useEffect(() => {
    if (!pollId || !groupId || !user) return;

    const channel = supabase
      .channel('tally_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_choices',
          filter: `poll_id=eq.${pollId}`
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (row && row.poll_id === pollId && row.group_id === groupId) {
            // Refresh tallies for any group change
            fetchTallies();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, groupId, user?.id, fetchTallies]);

  // Debounced refresh
  useEffect(() => {
    if (!pollId || !groupId) return;
    
    const timeoutId = setTimeout(fetchTallies, 150);
    return () => clearTimeout(timeoutId);
  }, [pollId, groupId, fetchTallies]);

  return {
    tallies,
    topPicks,
    groupSize,
    loading,
    slotLookup,
    getIntensityColor,
    refetch: fetchTallies
  };
};