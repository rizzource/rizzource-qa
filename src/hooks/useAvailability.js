import { useState, useEffect, useCallback } from 'react';

import { toast } from 'react-toastify';

// Generate 15-minute time slots between start and end times
const generateTimeSlots = (startTime, endTime) => {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  let current = new Date(start);
  while (current <= end) {
    const timeString = current.toTimeString().slice(0, 5); // HH:MM format
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + 15);
  }
  
  return slots;
};

export const useAvailability = (dates, startTime = '09:00', endTime = '17:00') => {
  const [userAvailability, setUserAvailability] = useState({});
  const [groupHeatmap, setGroupHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const timeSlots = generateTimeSlots(startTime, endTime);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Load initial availability data
  useEffect(() => {
    if (!currentUser?.email || !dates.length) return;

    const loadAvailability = async () => {
      setLoading(true);
      
      try {
        // Load user's availability
        const { data: userSlots, error: userError } = await supabase
          .from('availability_slots')
          .select('*')
          .eq('user_email', currentUser.email)
          .in('event_date', dates);

        if (userError) throw userError;

        // Transform to nested object structure
        const userAvailabilityMap = {};
        dates.forEach(date => {
          userAvailabilityMap[date] = {};
          timeSlots.forEach(time => {
            const slot = userSlots.find(s => 
              s.event_date === date && s.time_slot === time + ':00'
            );
            userAvailabilityMap[date][time] = slot?.is_available || false;
          });
        });

        setUserAvailability(userAvailabilityMap);

        // Load group heatmap data for each date
        const heatmapPromises = dates.map(async (date) => {
          const { data, error } = await supabase
            .rpc('get_availability_heatmap', { target_date: date });
          
          if (error) throw error;
          
          const heatmapData = {};
          timeSlots.forEach(time => {
            const slot = data.find(d => d.time_slot === time + ':00');
            heatmapData[time] = {
              availableCount: slot?.available_count || 0,
              totalParticipants: slot?.total_participants || 0,
              percentage: slot?.availability_percentage || 0
            };
          });
          
          return { date, heatmapData };
        });

        const heatmapResults = await Promise.all(heatmapPromises);
        const groupHeatmapMap = {};
        heatmapResults.forEach(({ date, heatmapData }) => {
          groupHeatmapMap[date] = heatmapData;
        });

        setGroupHeatmap(groupHeatmapMap);
      } catch (error) {
        console.error('Error loading availability:', error);
        toast.error('Failed to load availability data');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [currentUser?.email, dates.join(','), timeSlots.join(',')]);

  // Real-time subscription for group heatmap updates
  useEffect(() => {
    if (!dates.length) return;

    const channel = supabase
      .channel('availability-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_slots',
          filter: `event_date=in.(${dates.join(',')})`
        },
        () => {
          // Reload heatmap data when any availability changes
          refreshHeatmap();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dates.join(',')]);

  const refreshHeatmap = useCallback(async () => {
    if (!dates.length) return;

    try {
      const heatmapPromises = dates.map(async (date) => {
        const { data, error } = await supabase
          .rpc('get_availability_heatmap', { target_date: date });
        
        if (error) throw error;
        
        const heatmapData = {};
        timeSlots.forEach(time => {
          const slot = data.find(d => d.time_slot === time + ':00');
          heatmapData[time] = {
            availableCount: slot?.available_count || 0,
            totalParticipants: slot?.total_participants || 0,
            percentage: slot?.availability_percentage || 0
          };
        });
        
        return { date, heatmapData };
      });

      const heatmapResults = await Promise.all(heatmapPromises);
      const groupHeatmapMap = {};
      heatmapResults.forEach(({ date, heatmapData }) => {
        groupHeatmapMap[date] = heatmapData;
      });

      setGroupHeatmap(groupHeatmapMap);
    } catch (error) {
      console.error('Error refreshing heatmap:', error);
    }
  }, [dates.join(','), timeSlots.join(',')]);

  const updateAvailability = useCallback(async (date, time, isAvailable) => {
    if (!currentUser?.id || !currentUser?.email) return;

    try {
      const timeSlot = time + ':00'; // Convert HH:MM to HH:MM:SS
      
      // Upsert the availability slot
      const { error } = await supabase
        .from('availability_slots')
        .upsert({
          user_id: currentUser.id,
          user_email: currentUser.email,
          event_date: date,
          time_slot: timeSlot,
          is_available: isAvailable
        }, {
          onConflict: 'user_email,event_date,time_slot'
        });

      if (error) throw error;

      // Update local state immediately for responsive UI
      setUserAvailability(prev => ({
        ...prev,
        [date]: {
          ...prev[date],
          [time]: isAvailable
        }
      }));

    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to save availability');
    }
  }, [currentUser]);

  const toggleAvailability = useCallback((date, time) => {
    const currentStatus = userAvailability[date]?.[time] || false;
    updateAvailability(date, time, !currentStatus);
  }, [userAvailability, updateAvailability]);

  const setAvailabilityRange = useCallback((date, startTime, endTime, isAvailable) => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    for (let i = minIndex; i <= maxIndex; i++) {
      updateAvailability(date, timeSlots[i], isAvailable);
    }
  }, [timeSlots, updateAvailability]);

  return {
    userAvailability,
    groupHeatmap,
    loading,
    timeSlots,
    toggleAvailability,
    setAvailabilityRange,
    refreshHeatmap
  };
};