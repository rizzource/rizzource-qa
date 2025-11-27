import { useState, useEffect, useCallback, useMemo } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const useChoiceTallies = (pollId) => {
  const { groupId } = useAuth();
  const [tallies, setTallies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupSize, setGroupSize] = useState(1);

  const fetchTallies = useCallback(async () => {
    if (!pollId) return;
    
    try {
      setLoading(true);
      
      // Get all choices for this poll - RLS will filter by group automatically
      const { data: choicesData, error: choicesError } = await supabase
        .from('meeting_choices')
        .select('slot_id, user_id')
        .eq('poll_id', pollId);
      
      if (choicesError) throw choicesError;

      // Get all slots for this poll to ensure we have complete data
      const { data: slotsData, error: slotsError } = await supabase
        .from('meeting_slots')
        .select('id, date, start_time, end_time')
        .eq('poll_id', pollId);

      if (slotsError) throw slotsError;

      // Calculate tallies by grouping choices by slot_id
      const slotCounts = {};
      choicesData.forEach(choice => {
        slotCounts[choice.slot_id] = (slotCounts[choice.slot_id] || 0) + 1;
      });

      // Create tallies array with slot information
      const talliesData = slotsData.map(slot => ({
        slot_id: slot.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        choice_count: slotCounts[slot.id] || 0
      }));

      // Get unique users in this group who made choices
      const uniqueUsers = new Set(choicesData.map(choice => choice.user_id));
      setGroupSize(Math.max(uniqueUsers.size, 1));
      setTallies(talliesData);
    } catch (error) {
      console.error('Error fetching tallies:', error);
      toast.error('Failed to fetch choice tallies');
    } finally {
      setLoading(false);
    }
  }, [pollId]);

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

  // Debounced refresh
  useEffect(() => {
    if (!pollId) return;
    
    const timeoutId = setTimeout(fetchTallies, 150);
    return () => clearTimeout(timeoutId);
  }, [pollId, fetchTallies]);

  // Set up realtime subscription for group tally changes
  useEffect(() => {
    if (!pollId) return;

    const channel = supabase
      .channel('meeting_choices_tallies')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meeting_choices',
        filter: `poll_id=eq.${pollId}`
      }, (payload) => {
        // Refresh tallies when any changes occur - RLS will filter appropriately
        fetchTallies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, fetchTallies]);

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