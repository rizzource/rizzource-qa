import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Users, ArrowLeft } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useAvailability } from '@/hooks/useAvailability';
import AvailabilityGrid from './AvailabilityGrid';
import GroupHeatmapGrid from './GroupHeatmapGrid';

import { toast } from 'react-toastify';

const AvailabilityScheduler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedulingData, setSchedulingData] = useState(null);
  const [availabilityDates, setAvailabilityDates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();

    // Get scheduling data from location state or use defaults
    const data = location.state || {
      userType: 'mentee',
      dateType: 'days',
      selectedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      earliestTime: '09:00',
      latestTime: '17:00',
      activities: ['general']
    };
    
    setSchedulingData(data);
    generateAvailabilityDates(data);
  }, [location.state, navigate]);

  const generateAvailabilityDates = (data) => {
    let dates = [];
    
    if (data.dateType === 'specific' && data.selectedDates?.length > 0) {
      // Use specific dates
      dates = data.selectedDates.map(date => {
        if (typeof date === 'string') {
          return date;
        }
        return format(date, 'yyyy-MM-dd');
      });
    } else if (data.dateType === 'days' && data.selectedDays?.length > 0) {
      // Generate dates for next 4 weeks based on selected days
      const dayMap = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6
      };
      
      const today = new Date();
      const weekStart = startOfWeek(today);
      
      for (let week = 0; week < 4; week++) {
        data.selectedDays.forEach(dayName => {
          const dayIndex = dayMap[dayName.toLowerCase()];
          if (dayIndex !== undefined) {
            const date = addDays(weekStart, week * 7 + dayIndex);
            if (date >= today) {
              dates.push(format(date, 'yyyy-MM-dd'));
            }
          }
        });
      }
    }
    
    setAvailabilityDates(dates.sort());
  };

  const {
    userAvailability,
    groupHeatmap,
    loading,
    timeSlots,
    toggleAvailability,
    setAvailabilityRange
  } = useAvailability(
    availabilityDates,
    schedulingData?.earliestTime || '09:00',
    schedulingData?.latestTime || '17:00'
  );

  const handleBack = () => {
    navigate('/mentorship-selection');
  };

  const handleContinue = () => {
    // Navigate to matchup page with updated data
    navigate('/matchup', {
      state: {
        ...schedulingData,
        availabilityCompleted: true
      }
    });
  };

  if (!schedulingData || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!availabilityDates.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-foreground">No Dates Available</CardTitle>
            <CardDescription className="text-center">
              No dates were found for your scheduling preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scheduling
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-foreground hover:bg-muted flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scheduling
          </Button>

          <div className="text-center mb-6">
            <div className="mx-auto mb-4 p-3 bg-accent/20 rounded-full w-fit">
              <Clock className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              When2meet Style Availability
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mark your available times and see when others are available too. 
              Changes are saved automatically and updated in real-time.
            </p>
          </div>

          {/* Summary info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">User Type</p>
                <p className="font-medium text-foreground capitalize">{schedulingData.userType}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <CalendarIcon className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Time Range</p>
                <p className="font-medium text-foreground">
                  {schedulingData.earliestTime} - {schedulingData.latestTime}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="font-medium text-foreground">
                  {schedulingData.activities?.join(', ') || 'Not specified'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading availability data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Availability Grids */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AvailabilityGrid
                dates={availabilityDates}
                timeSlots={timeSlots}
                availability={userAvailability}
                onToggle={toggleAvailability}
                onRangeSelect={setAvailabilityRange}
                title="Your Availability"
              />
              
              <GroupHeatmapGrid
                dates={availabilityDates}
                timeSlots={timeSlots}
                heatmapData={groupHeatmap}
                title="Group Availability"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 pt-8">
              <Button variant="outline" onClick={handleBack}>
                Back to Scheduling
              </Button>
              <Button onClick={handleContinue}>
                Continue to Matchup
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityScheduler;