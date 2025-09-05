import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const mockEvents = [
  {
    id: 1,
    title: 'Chapter 1',
    date: 'October 2025',
    month: 'Oct',
    monthIndex: 2,
    description: 'Introduction to Constitutional Law',
  },
  {
    id: 2,
    title: 'Contract Law Starts',
    date: 'October 2025',
    month: 'Oct',
    monthIndex: 2,
    description: 'Beginning of Contract Law course',
  },
  {
    id: 3,
    title: 'Midterm Exams',
    date: 'November 2025',
    month: 'Nov',
    monthIndex: 3,
    description: 'First semester midterm examinations',
  },
  {
    id: 4,
    title: 'Final Exams',
    date: 'December 2025',
    month: 'Dec',
    monthIndex: 4,
    description: 'End of semester final examinations',
  },
  {
    id: 5,
    title: 'Spring Semester Begins',
    date: 'January 2026',
    month: 'Jan',
    monthIndex: 5,
    description: 'Start of spring semester',
  },
  {
    id: 6,
    title: 'Career Fair',
    date: 'February 2026',
    month: 'Feb',
    monthIndex: 6,
    description: 'Annual law school career fair',
  },
  {
    id: 7,
    title: 'Moot Court Competition',
    date: 'March 2026',
    month: 'Mar',
    monthIndex: 7,
    description: 'Annual moot court competition',
  },
  {
    id: 8,
    title: 'Final Exams',
    date: 'May 2026',
    month: 'May',
    monthIndex: 9,
    description: 'End of year final examinations',
  },
];

const months = ['Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

const Timeline = () => {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [eventType, setEventType] = useState('Academic Events');

  const getEventsForMonth = (month) => {
    return mockEvents.filter(event => event.month === month);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-4xl font-bold text-primary">RIZZource</div>
          </div>
          <p className="text-muted-foreground">The ultimate resource platform for law students</p>
        </div>

        {/* Event Type Toggle */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {eventType}
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
                >
                  {/* Month Dot */}
                  <div className={`w-3 h-3 rounded-full border-2 bg-background mb-2 ${
                    hasEvents ? 'border-primary' : 'border-border'
                  }`}></div>
                  
                  {/* Month Label */}
                  <div className="text-sm font-medium text-foreground uppercase tracking-wider">
                    {month}
                  </div>
                  
                  {/* Year indicator in the middle */}
                  {index === 4 && (
                    <div className="absolute -bottom-8 text-lg font-semibold text-foreground">
                      2025
                    </div>
                  )}
                  
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
};

export default Timeline;