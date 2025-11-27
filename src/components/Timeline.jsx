import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';


const mockEvents = [
  // --- Academic Timeline (Fall 2025) ---
  {
    id: 1,
    title: 'Begin drafting personal course outlines',
    date: 'Late October 2025',
    month: 'October',
    monthIndex: 9,
    year: 2025,
    description: 'Start first-pass drafts for each course; map topics and headings.',
    location: 'Self-paced',
    time: '—'
  },
  {
    id: 2,
    title: 'Refine personal course outlines',
    date: 'Early November 2025',
    month: 'November',
    monthIndex: 10,
    year: 2025,
    description: 'Tighten organization and add case notes; finalize before reading days.',
    location: 'Self-paced',
    time: '—'
  },
  {
    id: 3,
    title: 'Last day of fall classes',
    date: 'Nov 24, 2025',
    month: 'November',
    monthIndex: 10,
    year: 2025,
    description: 'Instruction ends for the fall term.',
    location: 'Campus-wide',
    time: '—'
  },
  {
    id: 4,
    title: 'Reading days',
    date: 'Dec 1–2, 2025',
    month: 'December',
    monthIndex: 11,
    year: 2025,
    description: 'No classes; dedicated study time before finals.',
    location: '—',
    time: '—'
  },
  {
    id: 5,
    title: 'Final exams',
    date: 'Dec 3–12, 2025',
    month: 'December',
    monthIndex: 11,
    year: 2025,
    description: 'Comprehensive examinations for fall courses.',
    location: 'Exam venues',
    time: '—'
  },
  {
    id: 8,
    title: '1L Mock Interview Program – Registration closes',
    date: 'Jan 3, 2025',
    month: 'January',
    monthIndex: 0,
    year: 2025,
    description: 'Last day to register for the 1L Mock Interview Program.',
    location: 'Emory Career Center',
    time: 'Deadline'
  },
  {
    id: 9,
    title: '1L Mock Interview Program – Virtual interviews',
    date: 'Jan 27, 29 & 31, 2025',
    month: 'January',
    monthIndex: 0,
    year: 2025,
    description: 'Practice interviews with feedback.',
    location: 'Virtual',
    time: '—'
  },
  {
    id: 10,
    title: 'February Interview Program – Registration closes',
    date: 'Jan 3, 2025',
    month: 'January',
    monthIndex: 0,
    year: 2025,
    description: 'Final day to register for February Interview Program.',
    location: 'Emory Career Center',
    time: 'Deadline'
  },
  {
    id: 11,
    title: 'February Interview Program (virtual)',
    date: 'Feb 4–5, 2025',
    month: 'February',
    monthIndex: 1,
    year: 2025,
    description: 'Employer interviews held virtually.',
    location: 'Virtual',
    time: '—'
  },
  {
    id: 12,
    title: 'February Interview Program (on-campus)',
    date: 'Feb 6, 2025',
    month: 'February',
    monthIndex: 1,
    year: 2025,
    description: 'On-campus interviews with participating employers.',
    location: 'On-campus',
    time: '—'
  },
  {
    id: 13,
    title: 'March Interview Program – Registration closes',
    date: 'Feb 14, 2025',
    month: 'February',
    monthIndex: 1,
    year: 2025,
    description: 'Final day to register for March Interview Program.',
    location: 'Emory Career Center',
    time: 'Deadline'
  },
  {
    id: 14,
    title: 'March Interview Program (virtual)',
    date: 'Mar 18–19, 2025',
    month: 'March',
    monthIndex: 2,
    year: 2025,
    description: 'Two days of virtual interviews.',
    location: 'Virtual',
    time: '—'
  },
  {
    id: 15,
    title: 'March Interview Program (on-campus)',
    date: 'Mar 20, 2025',
    month: 'March',
    monthIndex: 2,
    year: 2025,
    description: 'On-campus interview day.',
    location: 'On-campus',
    time: '—'
  },
  {
    id: 16,
    title: 'April Interview Program – Registration closes',
    date: 'Feb 28, 2025',
    month: 'February',
    monthIndex: 1,
    year: 2025,
    description: 'Final day to register for April Interview Program.',
    location: 'Emory Career Center',
    time: 'Deadline'
  },
  {
    id: 17,
    title: 'April Interview Program (virtual)',
    date: 'Apr 1–2, 2025',
    month: 'April',
    monthIndex: 3,
    year: 2025,
    description: 'Two virtual interview days.',
    location: 'Virtual',
    time: '—'
  },
  {
    id: 18,
    title: 'Meet the Employer – Registration closes',
    date: 'Apr 25, 2025',
    month: 'April',
    monthIndex: 3,
    year: 2025,
    description: 'Last day to register for Meet the Employer.',
    location: 'Emory Career Center',
    time: 'Deadline'
  },
  {
    id: 19,
    title: 'Meet the Employer (virtual)',
    date: 'May 5, 2025',
    month: 'May',
    monthIndex: 4,
    year: 2025,
    description: 'Virtual networking with employers.',
    location: 'Virtual',
    time: '—'
  },
  {
    id: 20,
    title: 'Meet the Employer (on-campus)',
    date: 'May 6, 2025',
    month: 'May',
    monthIndex: 4,
    year: 2025,
    description: 'On-campus networking and employer booths.',
    location: 'On-campus',
    time: '—'
  },

  // --- National Recruiting Timelines / Windows ---
  {
    id: 21,
    title: 'Big law & mid-sized firms – 1L applications open',
    date: 'Dec 1, 2025',
    month: 'December',
    monthIndex: 11,
    year: 2025,
    description: 'Most firms accept 1L apps starting Dec 1; decisions often Feb–Mar 2026.',
    location: 'Various',
    time: 'Opens'
  },
  {
    id: 22,
    title: 'Government & public interest – 1L apps open',
    date: 'Dec 1, 2025',
    month: 'December',
    monthIndex: 11,
    year: 2025,
    description: 'Many public sector employers begin accepting 1L apps.',
    location: 'Various',
    time: 'Opens'
  },
  {
    id: 23,
    title: 'Judicial externships – typical window',
    date: 'Dec 2025 – Jan 2026',
    month: 'December',
    monthIndex: 11,
    year: 2025,
    description: 'Most applications submitted in Dec–Jan.',
    location: 'Courts',
    time: '—'
  },
  {
    id: 25,
    title: 'OCI timing trend check',
    date: 'May–June (trend)',
    month: 'May',
    monthIndex: 4,
    year: 2025,
    description: 'Some schools moved OCI to May–June; Emory still uses fall OCI. Monitor for changes.',
    location: 'Career Services',
    time: '—'
  },

  // --- Public Interest Fellowships ---
  {
    id: 29,
    title: 'Haywood Burns Memorial Fellowship – deadline',
    date: 'Jan 6, 2025',
    month: 'January',
    monthIndex: 0,
    year: 2025,
    description: 'Application deadline.',
    location: 'External',
    time: 'Deadline'
  },
  {
    id: 30,
    title: 'Peggy Browning Fund Fellowship – deadline',
    date: 'Jan 17, 2025',
    month: 'January',
    monthIndex: 0,
    year: 2025,
    description: 'Application deadline.',
    location: 'External',
    time: 'Deadline'
  },
  {
    id: 32,
    title: 'EPIC Grants (Emory) – deadline',
    date: 'Mar 31, 2025 (5 p.m.)',
    month: 'March',
    monthIndex: 2,
    year: 2025,
    description: 'EPIC summer funding applications due.',
    location: 'Emory',
    time: '5:00 PM'
  },

  // --- Government & Judicial ---
  {
    id: 33,
    title: 'DOJ SLIP – applications window',
    date: 'Aug 22 – Sep 2, 2025',
    month: 'August',
    monthIndex: 7,
    year: 2025,
    description: 'Apply for DOJ Summer Law Intern Program.',
    location: 'USAJOBS',
    time: '—'
  },
  {
    id: 35,
    title: 'HNBA/VIA Avanza Internships – window',
    date: 'Jun 30 – Jul 18, 2025',
    month: 'June',
    monthIndex: 5,
    year: 2025,
    description: 'Applications accepted during this period.',
    location: 'External',
    time: '—'
  },

  // --- In-House ---
  {
    id: 37,
    title: 'AbbVie Summer Associate – start date',
    date: 'May 20, 2025',
    month: 'May',
    monthIndex: 4,
    year: 2025,
    description: 'Target start date (example).',
    location: 'In-house',
    time: '—'
  },

  // --- Suggested Action Plan (blocks) ---
  {
    id: 38,
    title: 'Action Plan: Oct–Nov 2025',
    date: 'Oct–Nov 2025',
    month: 'October',
    monthIndex: 9,
    year: 2025,
    description: 'Draft/refine outlines; register for Spring Interview Programs; research diversity fellowships; prep materials.',
    location: '—',
    time: '—'
  },
  {
    id: 39,
    title: 'Action Plan: Dec 2025',
    date: 'Dec 2025',
    month: 'December',
    monthIndex: 11,
    year: 2025,
    description: 'Apply starting Dec 1 to big law, government, public interest; submit fellowships with Dec deadlines; begin judicial externship apps.',
    location: '—',
    time: '—'
  },
  {
    id: 42,
    title: 'Action Plan: Aug–Sep 2025',
    date: 'Aug–Sep 2025',
    month: 'August',
    monthIndex: 7,
    year: 2025,
    description: 'Apply to DOJ SLIP (Aug 22–Sep 2); watch state AG & corporate postings.',
    location: '—',
    time: '—'
  }
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Timeline = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025); // Default to 2025
  const [direction, setDirection] = useState(0); // For animation direction
  const [events, setEvents] = useState(mockEvents);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [year, setYear] = useState("2025/2026");

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved year:", year);
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('year', { ascending: true })
        .order('month_index', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        setEvents(mockEvents); // Fallback to mock events
      } else {
        // Combine database events with mock events
        const combinedEvents = [...mockEvents, ...data.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          month: event.month,
          monthIndex: event.month_index,
          year: event.year,
          description: event.description || '',
          location: event.location || '',
          time: event.time || '',
          priority: event.priority === true || event.priority === 'true'
        }))];
        setEvents(combinedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(mockEvents); // Fallback to mock events
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = ['All', 2024, 2025, 2026];

  const getFilteredEvents = () => {
    if (currentYear === 'All') {
      return events;
    }
    return events.filter(event => event.year === currentYear);
  };

  const filteredEvents = getFilteredEvents();

  const groupEventsByMonth = () => {
    const grouped = {};
    months.forEach((month, index) => {
      grouped[index] = filteredEvents.filter(event => event.monthIndex === index);
    });
    return grouped;
  };

  const eventsByMonth = groupEventsByMonth();

  const handleYearChange = (newYear) => {
    const currentIndex = yearOptions.indexOf(currentYear);
    const newIndex = yearOptions.indexOf(newYear);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentYear(newYear);
  };

  const handlePrevYear = () => {
    const currentIndex = yearOptions.indexOf(currentYear);
    const prevIndex = currentIndex === 0 ? yearOptions.length - 1 : currentIndex - 1;
    handleYearChange(yearOptions[prevIndex]);
  };

  const handleNextYear = () => {
    const currentIndex = yearOptions.indexOf(currentYear);
    const nextIndex = currentIndex === yearOptions.length - 1 ? 0 : currentIndex + 1;
    handleYearChange(yearOptions[nextIndex]);
  };

  const TimelineEvent = ({ event, isCompact = true }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${isCompact ? 'text-xs p-2' : 'text-sm p-3'} bg-card border border-border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => isCompact ? null : setSelectedEvent(event)}
    >
      <div className="font-medium text-foreground">{event.title}</div>
      {!isCompact && (
        <div className="text-muted-foreground mt-1">{event.date}</div>
      )}
    </motion.div>
  );
const getEventsForMonth = (month) => {
    return events.filter(event => event.month === month);
  };
   const [hoveredMonth, setHoveredMonth] = useState(null);
  const [eventType, setEventType] = useState('Academic Events');
  const CompactTimeline = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-background p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">

        {/* Event Type Toggle */}
      <div className="flex items-center mb-8 space-x-4">
  <Button 
    variant="outline" 
    onClick={() => setEventType("Academic Events")} 
    className="flex items-center bg-primary text-primary-foreground hover:bg-primary/70 hover:text-white"
  >
    Academic Events
  </Button>

   <Button 
    variant="outline" 
    onClick={() => setEventType("Job Events")} 
    className="flex items-center border-primary bg-white text-primary hover:bg-primary/20"
  >
    Job Events
  </Button> 
</div>

        {/* Timeline Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {isEditing ? (
            <>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="text-2xl font-semibold text-center border-b border-accent focus:outline-none focus:ring-0 bg-transparent"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 rounded-full hover:bg-accent/10"
              >
                <Check className="w-5 h-5 text-accent" />
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-center">
                Timeline - 1L ({year})
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-full hover:bg-accent/10"
              >
                <Pencil className="w-5 h-5 text-accent" />
              </button>
            </>
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border transform -translate-y-1/2"></div>
          
          {/* Months */}
          <div className="flex justify-between items-center relative z-10">
            {months.map((month, index) => {
              const monthEvents = getEventsForMonth(month);
              const hasEvents = monthEvents.length > 0;
              
              return (
                <div
                  key={month}
                  className="relative flex flex-col items-center cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  onClick={() => setIsExpanded(true)}
                >
                  {/* Month Dot */}
                  <div className={`w-3 h-3 rounded-full border-2 bg-background mb-2 ${
                    hasEvents ? 'border-primary' : 'border-border'
                  }`}></div>
                  
                  {/* Month Label with event count */}
                  <div className="text-sm font-medium text-foreground text-center">
                    {month}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({monthEvents.length})
                    </span>
                  </div>
                  
                  {/* Events Dropdown */}
                  <AnimatePresence>
                    {hoveredMonth === month && hasEvents && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-6 left-1/2 transform -translate-x-1/2 z-20"
                      >
                        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[250px]">
                          <div className="text-sm font-semibold text-card-foreground mb-3 border-b border-border pb-2">
                            {month}
                          </div>

                          <div className="space-y-2">
                            {(() => {
                              const priorityEvents = monthEvents.filter((event) => event.priority);
                              const displayedEvents = priorityEvents.slice(0, 5);
                              const remainingCount = priorityEvents.length - displayedEvents.length;

                              return (
                                <>
                                  {displayedEvents.map((event) => (
                                    <div key={event.id} className="text-sm">
                                      <div className="font-medium text-card-foreground">
                                        • {event.title}
                                      </div>
                                      {/* Optional description */}
                                      {/* {event.description && (
                                        <div className="text-muted-foreground text-xs mt-1 ml-2">
                                          {event.description}
                                        </div>
                                      )} */}
                                    </div>
                                  ))}

                                  {remainingCount > 0 && (
                                    <div className="text-xs text-muted-foreground italic">
                                      +{remainingCount} more priority event
                                      {remainingCount > 1 ? "s" : ""}
                                    </div>
                                  )}

                                  {priorityEvents.length === 0 && (
                                    <div className="text-xs text-muted-foreground italic">
                                      No priority events this month.
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    );
  };

    const ExpandedTimeline = () => {
    // Sort events by year, then by monthIndex
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background z-50 overflow-y-auto"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-primary">
              Academic Year 2025/2026 Timeline
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Sorted Events */}
          <motion.div 
            key={`expanded-events-${currentYear}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {sortedEvents
            .filter(event => event.priority) // ✅ show only priority events
            .map((event, eventIndex) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: eventIndex * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                    {event.month}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  };


 const EventModal = () => {
  // Nothing to render? Return null (prevents creating the portal at all)
  if (!selectedEvent) return null;

  // Render the modal into document.body so it escapes any stacking contexts
  return createPortal(
    (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
          aria-hidden="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedEvent.title}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-foreground">{selectedEvent.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEvent(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{selectedEvent.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedEvent.location}</span>
              </div>
            </div>

            <p className="text-foreground leading-relaxed">
              {selectedEvent.description}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    ),
    document.body
  );
};


  return (
    <>
      <div className="w-full py-16">
        <CompactTimeline />
      </div>
      
      <AnimatePresence>
        {isExpanded && <ExpandedTimeline />}
      </AnimatePresence>
      
      <EventModal />
    </>
  );
};

export default Timeline;