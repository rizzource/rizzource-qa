import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockEvents = [
  {
    id: 1,
    title: 'Start of School Year',
    date: 'January 10',
    month: 'Jan',
    monthIndex: 0,
    description: 'Welcome back to the new academic year! Orientation sessions and course registration.',
    location: 'Main Campus',
    time: '9:00 AM'
  },
  {
    id: 2,
    title: 'Start of Midterm Exams',
    date: 'March 12',
    month: 'Mar',
    monthIndex: 2,
    description: 'Mid-semester examinations begin. Review your study schedules and exam timetables.',
    location: 'Examination Hall',
    time: '10:00 AM'
  },
  {
    id: 3,
    title: 'Sports Week',
    date: 'March 25',
    month: 'Mar',
    monthIndex: 2,
    description: 'Annual inter-faculty sports competition. Participate in various sporting events.',
    location: 'Sports Complex',
    time: '8:00 AM'
  },
  {
    id: 4,
    title: 'National Law Seminar',
    date: 'June 15',
    month: 'Jun',
    monthIndex: 5,
    description: 'Distinguished speakers discuss contemporary legal issues and career opportunities.',
    location: 'Auditorium',
    time: '2:00 PM'
  },
  {
    id: 5,
    title: 'Legal Writing Workshop',
    date: 'September 5',
    month: 'Sep',
    monthIndex: 8,
    description: 'Enhance your legal writing skills with expert guidance and practical exercises.',
    location: 'Conference Room A',
    time: '1:00 PM'
  },
  {
    id: 6,
    title: 'Moot Court Competition',
    date: 'October 20',
    month: 'Oct',
    monthIndex: 9,
    description: 'Annual moot court competition showcasing student advocacy skills.',
    location: 'Moot Court Room',
    time: '11:00 AM'
  },
  {
    id: 7,
    title: 'Guest Lecture by Supreme Court Judge',
    date: 'November 10',
    month: 'Nov',
    monthIndex: 10,
    description: 'An exclusive session with a sitting Supreme Court Judge sharing insights on judicial practices.',
    location: 'Main Auditorium',
    time: '3:00 PM'
  },
  {
    id: 8,
    title: 'End of School Year',
    date: 'December 18',
    month: 'Dec',
    monthIndex: 11,
    description: 'Final examinations conclude and graduation ceremonies for outgoing students.',
    location: 'Main Campus',
    time: '4:00 PM'
  }
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Timeline = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const groupEventsByMonth = () => {
    const grouped = {};
    months.forEach((month, index) => {
      grouped[index] = mockEvents.filter(event => event.monthIndex === index);
    });
    return grouped;
  };

  const eventsByMonth = groupEventsByMonth();

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

  const CompactTimeline = () => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary mb-2">Academic Year Timeline</h3>
        <p className="text-muted-foreground">Click anywhere on the timeline to explore details</p>
      </div>
      
      <div 
        className="relative cursor-pointer hover:bg-muted/20 p-4 rounded-lg transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        {/* Events above timeline */}
        <div className="mb-8 relative h-32">
          {months.map((month, index) => (
            <div key={month} className="absolute" style={{ left: `${(index / 11) * 100}%`, transform: 'translateX(-50%)' }}>
              <div className="space-y-1">
                {eventsByMonth[index].map((event, eventIndex) => (
                  <div key={event.id} className="w-24">
                    <TimelineEvent event={event} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline line */}
        <div className="relative">
          <div className="h-1 bg-accent rounded-full"></div>
          
          {/* Month markers */}
          {months.map((month, index) => (
            <div key={month} className="absolute top-2" style={{ left: `${(index / 11) * 100}%`, transform: 'translateX(-50%)' }}>
              <div className="w-3 h-3 bg-primary rounded-full -mt-1.5"></div>
              <div className="mt-2 text-sm font-medium text-primary">{month}</div>
            </div>
          ))}
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
          <h2 className="text-3xl font-bold text-primary">Academic Year 2024 Timeline</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: event.id * 0.1 }}
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
        </div>
      </div>
    </motion.div>
  );

  const EventModal = () => (
    <AnimatePresence>
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
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
            
            <p className="text-foreground leading-relaxed">{selectedEvent.description}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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