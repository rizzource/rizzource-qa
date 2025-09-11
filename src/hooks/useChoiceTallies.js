import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-toastify';

export const useChoiceTallies = (pollId) => {
  const [tallies, setTallies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupSize, setGroupSize] = useState(1);

  const fetchTallies = useCallback(async () => {
    if (!pollId) return;
    
    try {
      setLoading(true);
      
      // Get choice tallies
      const { data: talliesData, error: talliesError } = await supabase
        .rpc('get_choice_tallies', { poll_id_param: pollId });
      
      if (talliesError) throw talliesError;

      // Get total group size (unique users who made any choice)
      const { data: groupData, error: groupError } = await supabase
        .from('meeting_choices')
        .select('user_id')
        .eq('poll_id', pollId);

      if (groupError) throw groupError;
      
      const uniqueUsers = new Set(groupData.map(choice => choice.user_id));
      setGroupSize(Math.max(uniqueUsers.size, 1));
      setTallies(talliesData || []);
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

  // Realtime updates to keep tallies and top picks fresh
  useEffect(() => {
    if (!pollId) return;

    const channel = supabase
      .channel(`mc-tallies-${pollId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meeting_choices', filter: `poll_id=eq.${pollId}` },
        () => {
          fetchTallies();
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
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