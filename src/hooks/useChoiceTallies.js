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
      
      // Get choice tallies for the group
      const { data: groupData, error: groupError } = await supabase
        .from('meeting_choices')
        .select('slot_id, user_id')
        .eq('poll_id', pollId)
        .eq('group_id', groupId);

      if (groupError) throw groupError;
      
      // Aggregate tallies in JS
      const slotCounts = {};
      const uniqueUsers = new Set();
      
      groupData.forEach(choice => {
        uniqueUsers.add(choice.user_id);
        slotCounts[choice.slot_id] = (slotCounts[choice.slot_id] || 0) + 1;
      });
      
      // Convert to tallies format
      const talliesData = Object.entries(slotCounts).map(([slot_id, choice_count]) => ({
        slot_id,
        choice_count
      })).sort((a, b) => b.choice_count - a.choice_count);
      
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

  // Debounced refresh and real-time updates
  useEffect(() => {
    if (!pollId || !groupId) return;
    
    const timeoutId = setTimeout(fetchTallies, 150);
    return () => clearTimeout(timeoutId);
  }, [pollId, groupId, fetchTallies]);

  // Real-time subscription for group changes
  useEffect(() => {
    if (!pollId || !groupId || !user) return;

    const channel = supabase
      .channel('meeting_choices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_choices',
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (row.poll_id === pollId && row.group_id === groupId) {
            // Refresh tallies for any group change
            fetchTallies();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, groupId, user, fetchTallies]);

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