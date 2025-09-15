import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';

const mockEvents = [
  // --- Academic Timeline (Fall 2025) ---
  {
    id: 1,
    title: 'Begin drafting personal course outlines',
    date: 'Late October 2025',
    month: 'Oct',
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
    month: 'Nov',
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
    month: 'Nov',
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
    month: 'Dec',
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
    month: 'Dec',
    monthIndex: 11,
    year: 2025,
    description: 'Comprehensive examinations for fall courses.',
    location: 'Exam venues',
    time: '—'
  },
  {
    id: 6,
    title: 'Spring classes resume',
    date: 'Early January 2026',
    month: 'Jan',
    monthIndex: 0,
    year: 2026,
    description: 'New term begins. Also use early January for résumé updates, interview practice, and career planning.',
    location: 'Campus-wide',
    time: '—'
  },

  // --- Emory Career Center Spring Interview Programs (2025) ---
  // (Registration openings aligned to Oct 1, 2024 to match Jan–May 2025 interview dates.)
  {
    id: 7,
    title: 'Spring Interview Programs – Registration opens',
    date: 'Oct 1, 2024',
    month: 'Oct',
    monthIndex: 9,
    year: 2024,
    description: 'Registration opens for 1L Mock Interview, February, March, April Interview Programs, and Meet the Employer.',
    location: 'Emory Career Center',
    time: 'Opens'
  },
  {
    id: 8,
    title: '1L Mock Interview Program – Registration closes',
    date: 'Jan 3, 2025',
    month: 'Jan',
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
    month: 'Jan',
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
    month: 'Jan',
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
    month: 'Feb',
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
    month: 'Feb',
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
    month: 'Feb',
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
    month: 'Mar',
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
    month: 'Mar',
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
    month: 'Feb',
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
    month: 'Apr',
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
    month: 'Apr',
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
    month: 'Dec',
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
    month: 'Dec',
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
    month: 'Dec',
    monthIndex: 11,
    year: 2025,
    description: 'Most applications submitted in Dec–Jan.',
    location: 'Courts',
    time: '—'
  },
  {
    id: 24,
    title: 'Small firms – hiring often after grades',
    date: 'Jan–Mar 2026',
    month: 'Jan',
    monthIndex: 0,
    year: 2026,
    description: 'Many small firms move after first-semester grades post.',
    location: 'Various',
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

  // --- Big Law & Diversity Fellowships (2024) ---
  {
    id: 26,
    title: 'Fish & Richardson 1L Fellowship – window',
    date: 'Nov 1 – Dec 27, 2024',
    month: 'Nov',
    monthIndex: 10,
    year: 2024,
    description: 'Application period for 1L Diversity Fellowship.',
    location: 'External',
    time: '—'
  },
  {
    id: 27,
    title: 'Gibbs Law Group 1L Fellowship – opens',
    date: 'Nov 15, 2024',
    month: 'Nov',
    monthIndex: 10,
    year: 2024,
    description: 'Applications open.',
    location: 'External',
    time: 'Opens'
  },
  {
    id: 28,
    title: 'Gibbs Law Group 1L Fellowship – deadline',
    date: 'Dec 31, 2024',
    month: 'Dec',
    monthIndex: 11,
    year: 2024,
    description: 'Final day to apply.',
    location: 'External',
    time: 'Deadline'
  },

  // --- Public Interest Fellowships ---
  {
    id: 29,
    title: 'Haywood Burns Memorial Fellowship – deadline',
    date: 'Jan 6, 2025',
    month: 'Jan',
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
    month: 'Jan',
    monthIndex: 0,
    year: 2025,
    description: 'Application deadline.',
    location: 'External',
    time: 'Deadline'
  },
  {
    id: 31,
    title: 'PILI Summer Internship – 1L apps open',
    date: 'Nov 15, 2024',
    month: 'Nov',
    monthIndex: 10,
    year: 2024,
    description: '1L application opening.',
    location: 'External',
    time: 'Opens'
  },
  {
    id: 32,
    title: 'EPIC Grants (Emory) – deadline',
    date: 'Mar 31, 2025 (5 p.m.)',
    month: 'Mar',
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
    month: 'Aug',
    monthIndex: 7,
    year: 2025,
    description: 'Apply for DOJ Summer Law Intern Program.',
    location: 'USAJOBS',
    time: '—'
  },
  {
    id: 34,
    title: 'State AG (example: Alabama) – window',
    date: 'Dec 1, 2024 – Jan 31, 2025',
    month: 'Dec',
    monthIndex: 11,
    year: 2024,
    description: 'Example timeline for state AG offices.',
    location: 'External',
    time: '—'
  },
  {
    id: 35,
    title: 'HNBA/VIA Avanza Internships – window',
    date: 'Jun 30 – Jul 18, 2025',
    month: 'Jun',
    monthIndex: 5,
    year: 2025,
    description: 'Applications accepted during this period.',
    location: 'External',
    time: '—'
  },

  // --- In-House ---
  {
    id: 36,
    title: 'Cisco LEAP – deadline',
    date: 'Nov 15, 2024',
    month: 'Nov',
    monthIndex: 10,
    year: 2024,
    description: 'Deadline for Cisco LEAP program.',
    location: 'External',
    time: 'Deadline'
  },
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
    month: 'Oct',
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
    month: 'Dec',
    monthIndex: 11,
    year: 2025,
    description: 'Apply starting Dec 1 to big law, government, public interest; submit fellowships with Dec deadlines; begin judicial externship apps.',
    location: '—',
    time: '—'
  },
  {
    id: 40,
    title: 'Action Plan: Jan–Mar 2026',
    date: 'Jan–Mar 2026',
    month: 'Jan',
    monthIndex: 0,
    year: 2026,
    description: 'Do Mock Interview Program; attend Feb & Mar Interview Programs; submit Burns/EPIC/Peggy Browning; send transcripts where needed.',
    location: '—',
    time: '—'
  },
  {
    id: 41,
    title: 'Action Plan: Apr–Jul 2026',
    date: 'Apr–Jul 2026',
    month: 'Apr',
    monthIndex: 3,
    year: 2026,
    description: 'Attend April Program & May Meet the Employer; secure EPIC funding; apply to HNBA/VIA Avanza (June–July).',
    location: '—',
    time: '—'
  },
  {
    id: 42,
    title: 'Action Plan: Aug–Sep 2025',
    date: 'Aug–Sep 2025',
    month: 'Aug',
    monthIndex: 7,
    year: 2025,
    description: 'Apply to DOJ SLIP (Aug 22–Sep 2); watch state AG & corporate postings.',
    location: '—',
    time: '—'
  }
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Timeline = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025); // Default to 2025
  const [direction, setDirection] = useState(0); // For animation direction

  const yearOptions = ['All', 2024, 2025, 2026];

  const getFilteredEvents = () => {
    if (currentYear === 'All') {
      return mockEvents;
    }
    return mockEvents.filter(event => event.year === currentYear);
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
    return mockEvents.filter(event => event.month === month);
  };
   const [hoveredMonth, setHoveredMonth] = useState(null);
  const [eventType, setEventType] = useState('Academic Events');
  const CompactTimeline = () => (
  <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">

        {/* Event Type Toggle */}
      <div className="flex items-center mb-8 space-x-4">
  <Button 
    variant="outline" 
    onClick={() => setEventType("Academic Events")} 
    className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
  >
    Academic Events
  </Button>

   <Button 
    variant="outline" 
    onClick={() => setEventType("Job Events")} 
    className="flex items-center bg-yellow-500 text-white hover:bg-yellow-600"
  >
    Job Events
  </Button> 
</div>

        {/* Timeline Header */}
        <h2 className="text-2xl font-semibold text-center mb-8">Timeline - 1L (2025/2026)</h2>

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
                  
                  {/* Month Label */}
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">
                    {month}
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
                            {monthEvents.map((event) => (
                              <div key={event.id} className="text-sm">
                                <div className="font-medium text-card-foreground">
                                  • {event.title}
                                </div>
                                {event.description && (
                                  <div className="text-muted-foreground text-xs mt-1 ml-2">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            ))}
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

  const ExpandedTimeline = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-primary">
            Academic Year {currentYear === 'All' ? '2024-2026' : currentYear} Timeline
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

        {/* Year Carousel Controls in Expanded View */}
        <div className="flex items-center justify-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevYear}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <motion.div
            key={`expanded-${currentYear}`}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-8 min-w-[80px] text-center"
          >
            <div className="text-lg font-semibold text-primary">{currentYear}</div>
          </motion.div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextYear}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <motion.div 
          key={`expanded-events-${currentYear}`}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredEvents.map((event, eventIndex) => (
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