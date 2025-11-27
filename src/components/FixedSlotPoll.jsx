import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { useAuth } from '@/components/AuthProvider';
import { toast } from 'react-toastify';
import { useBestChoice } from '@/hooks/useBestChoice';
import { useChoiceTallies } from '@/hooks/useChoiceTallies';
import BestTimeGrid from './BestTimeGrid';
import TopPicksPanel from './TopPicksPanel';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FixedSlotPoll = () => {
  const { user } = useAuth();
  const [pollId, setPollId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { userChoices, toggleSlotChoice, clearAllChoices } = useBestChoice(pollId);
  const { 
    tallies,
    topPicks, 
    groupSize, 
    slotLookup, 
    getIntensityColor,
    loading: talliesLoading 
  } = useChoiceTallies(pollId);

  // Initialize poll and fetch slots
  useEffect(() => {
    if (user) {
      initializePoll();
    }
  }, [user]);

  const initializePoll = async () => {
    try {
      setLoading(true);
      
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
      
      // Fetch slots with date filter to ensure we get Sept 11-21, 2025
      const { data: slotsData, error: slotsError } = await supabase
        .from('meeting_slots')
        .select('slot_id:id, date, start_time, end_time')
        .eq('poll_id', currentPollId)
        .gte('date', '2025-09-11')
        .lte('date', '2025-09-21')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (slotsError) throw slotsError;
      
      // Debug logging to verify correct dates
      console.log('Fetched slots:', slotsData?.length, 'slots');
      console.log('Date range:', slotsData?.[0]?.date, 'to', slotsData?.[slotsData.length - 1]?.date);
      
      setSlots(slotsData || []);
    } catch (error) {
      console.error('Error initializing poll:', error);
      toast.error('Failed to initialize poll');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSlot = (date, startTime) => {
    // This would be implemented in BestTimeGrid if needed
    console.log('Scroll to slot:', date, startTime);
  };


  if (loading || talliesLoading) {
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
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 mt-10">
            <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Time Preference
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              Select multiple time slots that work for you. See popularity and find the best consensus times.
            </p>
          </div>

          {/* Three-column layout - more compact */}
          <div className="grid gap-3 lg:grid-cols-12">
            {/* Your Selections - Left sidebar */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-4 w-4" />
                    Your Selections ({userChoices.length})
                  </CardTitle>
                  <CardDescription className="text-xs">Click again to deselect.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {userChoices.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No selections yet.</div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {userChoices
                          .map((id) => slots.find(s => s.slot_id === id))
                          .filter(Boolean)
                          .filter(s => s.start_time !== '09:00')
                          .map((s) => (
                            <button
                              key={s.slot_id}
                              onClick={() => toggleSlotChoice(s.slot_id)}
                              className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] bg-background hover:bg-muted transition"
                              title="Click to remove"
                            >
                              {format(parseISO(s.date), 'MMM d')} at {s.start_time}
                              <X className="h-3 w-3 opacity-70" />
                            </button>
                          ))}
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllChoices}
                          className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                        >
                          Clear all
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Grid - Center */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <BestTimeGrid
                key={`grid-${pollId}-${slots.length}`}
                slots={slots.filter(slot => slot.start_time !== '09:00')}
                userChoices={userChoices}
                onToggleSlot={toggleSlotChoice}
                onClearAllChoices={clearAllChoices}
                slotLookup={slotLookup}
                getIntensityColor={getIntensityColor}
                tallies={tallies}
              />
            </div>

            {/* Top Picks - Right sidebar */}
            <div className="lg:col-span-3 order-3">
              <TopPicksPanel
                topPicks={topPicks.slice(0, 3)}
                userChoices={userChoices}
                groupSize={groupSize}
                slots={slots.filter(slot => slot.start_time !== '09:00')}
                onScrollToSlot={scrollToSlot}
                horizontal={false}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FixedSlotPoll;