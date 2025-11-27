import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

export const usePollVotes = (pollId) => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    if (!pollId) return;
    
    try {
      setLoading(true);
      
      // Fetch slot rankings
      const { data: rankings, error: rankingsError } = await supabase
        .rpc('get_slot_rankings', { poll_id_param: pollId });
      
      if (rankingsError) throw rankingsError;

      // Fetch user's votes
      const { data: votes, error: votesError } = await supabase
        .from('meeting_votes')
        .select('slot_id, choice')
        .eq('user_id', user.id);

      if (votesError) throw votesError;

      // Convert votes to lookup object
      const voteLookup = {};
      votes?.forEach(vote => {
        voteLookup[vote.slot_id] = vote.choice;
      });

      setSlots(rankings || []);
      setUserVotes(voteLookup);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch poll data');
    } finally {
      setLoading(false);
    }
  }, [pollId, user?.id]);

  const vote = useCallback(async (slotId, choice) => {
    if (!user || !pollId) return;

    // Optimistic update
    setUserVotes(prev => ({ ...prev, [slotId]: choice }));

    try {
      const { error } = await supabase
        .from('meeting_votes')
        .upsert({
          slot_id: slotId,
          user_id: user.id,
          choice: choice,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh data to get updated counts
      await fetchSlots();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to save vote');
      // Revert optimistic update
      setUserVotes(prev => {
        const updated = { ...prev };
        delete updated[slotId];
        return updated;
      });
    }
  }, [user, pollId, fetchSlots]);

  const cycleVote = useCallback(async (slotId) => {
    const currentVote = userVotes[slotId] || 'no';
    const nextVote = currentVote === 'no' ? 'maybe' : currentVote === 'maybe' ? 'yes' : 'no';
    await vote(slotId, nextVote);
  }, [userVotes, vote]);

  const getConsensusColor = useCallback((slot) => {
    const { yes_count, maybe_count, no_count } = slot;
    const total = yes_count + maybe_count + no_count;
    
    if (total === 0) return 'bg-muted';
    
    const yesPercent = yes_count / total;
    const maybePercent = maybe_count / total;
    
    if (yesPercent >= 0.5) return 'bg-green-500/20 border-green-500/40';
    if (maybePercent >= 0.3 || (yesPercent + maybePercent) >= 0.6) return 'bg-yellow-500/20 border-yellow-500/40';
    return 'bg-muted border-muted-foreground/20';
  }, []);

  const getUserVoteBorder = useCallback((slotId) => {
    const vote = userVotes[slotId];
    if (vote === 'yes') return 'border-2 border-primary';
    if (vote === 'maybe') return 'border-2 border-dashed border-primary';
    return '';
  }, [userVotes]);

  const getTopPicks = useCallback(() => {
    return slots.slice(0, 5);
  }, [slots]);

  useEffect(() => {
    if (user && pollId) {
      fetchSlots();
    }
  }, [user, pollId, fetchSlots]);

  return {
    slots,
    userVotes,
    loading,
    vote,
    cycleVote,
    getConsensusColor,
    getUserVoteBorder,
    getTopPicks,
    refetch: fetchSlots
  };
};