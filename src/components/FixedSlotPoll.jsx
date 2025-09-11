import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
              Multi-Select Time Preference
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              Select multiple time slots that work for you. See popularity and find the best consensus times.
            </p>
          </div>
  
          {/* Top Picks - Horizontal Display */}
          {/* <div className="mb-6">
            <TopPicksPanel
              topPicks={topPicks.slice(0, 3)}
              userChoices={userChoices}
              groupSize={groupSize}
              slots={slots}
              onScrollToSlot={scrollToSlot}
              horizontal={true}
            />
          </div> */}

          {/* Grid - Main Content */}
          <div className="w-full">
            <BestTimeGrid
              key={`grid-${pollId}-${slots.length}`}
              slots={slots}
              userChoices={userChoices}
              onToggleSlot={toggleSlotChoice}
              onClearAllChoices={clearAllChoices}
              slotLookup={slotLookup}
              getIntensityColor={getIntensityColor}
              tallies={tallies}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FixedSlotPoll;