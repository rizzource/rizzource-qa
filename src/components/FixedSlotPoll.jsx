import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';
import { usePollVotes } from '@/hooks/usePollVotes';
import CompactGridPoll from './CompactGridPoll';
import PollViewToggle from './PollViewToggle';
import FixedSlotList from './FixedSlotList';

const FixedSlotPoll = () => {
  const { user } = useAuth();
  const [pollId, setPollId] = useState(null);
  const [view, setView] = useState('grid');
  
  const {
    slots,
    userVotes,
    loading,
    cycleVote,
    getConsensusColor,
    getUserVoteBorder,
    getTopPicks
  } = usePollVotes(pollId);

  // Initialize poll and fetch data
  useEffect(() => {
    if (user) {
      initializePoll();
    }
  }, [user]);

  const initializePoll = async () => {
    try {
      // Check if poll already exists
      const { data: existingPolls } = await supabase
        .from('meeting_polls')
        .select('id')
        .eq('title', 'September 11-21 Availability Poll')
        .limit(1);

      let currentPollId;
      
      if (existingPolls && existingPolls.length > 0) {
        currentPollId = existingPolls[0].id;
      } else {
        // Create new poll using the seeder function
        const { data: newPollId, error } = await supabase.rpc('seed_fixed_poll');
        if (error) throw error;
        currentPollId = newPollId;
      }

      setPollId(currentPollId);
    } catch (error) {
      console.error('Error initializing poll:', error);
      toast.error('Failed to initialize poll');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading poll...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">
            <Calendar className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            September 11-21 Meeting Poll
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vote on your availability for each time slot. Votes are instant and you can change them anytime.
            </p>
            <PollViewToggle view={view} onViewChange={setView} />
          </div>
        </div>

        {/* Content based on view */}
        {view === 'grid' ? (
          <CompactGridPoll
            slots={slots}
            userVotes={userVotes}
            onVote={cycleVote}
            getConsensusColor={getConsensusColor}
            getUserVoteBorder={getUserVoteBorder}
            getTopPicks={getTopPicks}
          />
        ) : (
          <FixedSlotList
            slots={slots}
            userVotes={userVotes}
            onVote={cycleVote}
          />
        )}
      </div>
    </div>
  );
};

export default FixedSlotPoll;