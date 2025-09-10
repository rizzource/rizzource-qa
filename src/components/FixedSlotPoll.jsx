import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';

const FixedSlotPoll = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [pollId, setPollId] = useState(null);

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
      await fetchSlots(currentPollId);
    } catch (error) {
      console.error('Error initializing poll:', error);
      toast.error('Failed to initialize poll');
    }
  };

  const fetchSlots = async (pollId) => {
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
  };

  const handleVote = async (slotId, choice) => {
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
      await fetchSlots(pollId);
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
  };

  const getVoteButtonVariant = (slotId, choice, currentChoice) => {
    const userChoice = userVotes[slotId];
    if (userChoice === choice) {
      return choice === 'yes' ? 'default' : choice === 'maybe' ? 'secondary' : 'destructive';
    }
    return 'outline';
  };

  const formatSlotTime = (slot) => {
    const date = format(parseISO(slot.date), 'MMM dd');
    return `${date}, ${slot.start_time}-${slot.end_time}`;
  };

  const topSlot = slots[0];

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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Vote on your availability for each time slot. Votes are instant and you can change them anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slots List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Time Slots
                </CardTitle>
                <CardDescription>
                  Tap YES/MAYBE/NO for each slot. Results update in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div key={slot.slot_id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Slot Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatSlotTime(slot)}
                            </span>
                            {index === 0 && (
                              <Badge variant="default" className="bg-accent text-accent-foreground">
                                <Trophy className="h-3 w-3 mr-1" />
                                Top Pick
                              </Badge>
                            )}
                          </div>
                          
                          {/* Vote counts */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <span>✅</span>
                              <span className="text-muted-foreground">{slot.yes_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🤔</span>
                              <span className="text-muted-foreground">{slot.maybe_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>❌</span>
                              <span className="text-muted-foreground">{slot.no_count}</span>
                            </div>
                            <div className="ml-auto">
                              <Badge variant="secondary">
                                Score: {slot.score}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Vote buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={getVoteButtonVariant(slot.slot_id, 'yes')}
                            onClick={() => handleVote(slot.slot_id, 'yes')}
                            className="min-w-16"
                          >
                            YES
                          </Button>
                          <Button
                            size="sm"
                            variant={getVoteButtonVariant(slot.slot_id, 'maybe')}
                            onClick={() => handleVote(slot.slot_id, 'maybe')}
                            className="min-w-16"
                          >
                            MAYBE
                          </Button>
                          <Button
                            size="sm"
                            variant={getVoteButtonVariant(slot.slot_id, 'no')}
                            onClick={() => handleVote(slot.slot_id, 'no')}
                            className="min-w-16"
                          >
                            NO
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Pick Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Top Pick Right Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topSlot ? (
                  <div className="text-center">
                    <div className="mb-4 p-4 bg-accent/10 rounded-lg border-2 border-accent/20">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-accent" />
                        <span className="font-semibold text-lg">
                          {format(parseISO(topSlot.date), 'MMM dd')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {topSlot.start_time} - {topSlot.end_time}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <Badge variant="default" className="bg-accent text-accent-foreground">
                          {topSlot.score}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="text-lg">✅</div>
                          <div className="font-medium">{topSlot.yes_count}</div>
                          <div className="text-xs text-muted-foreground">Yes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">🤔</div>
                          <div className="font-medium">{topSlot.maybe_count}</div>
                          <div className="text-xs text-muted-foreground">Maybe</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg">❌</div>
                          <div className="font-medium">{topSlot.no_count}</div>
                          <div className="text-xs text-muted-foreground">No</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No votes yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedSlotPoll;