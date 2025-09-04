import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';

// --- your mockEvents unchanged ---
const mockEvents = [/* ... keep your array exactly as you posted ... */];

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Timeline = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025); // Default to 2025
  const [direction, setDirection] = useState(0); // For animation direction
  const [focusMonth, setFocusMonth] = useState(null); // monthIndex to focus in expanded

  const yearOptions = ['All', 2024, 2025, 2026];

  // ------- helpers -------
  const getFilteredEvents = useMemo(() => {
    if (currentYear === 'All') return mockEvents;
    return mockEvents.filter(e => e.year === currentYear);
  }, [currentYear]);

  // group events by monthIndex
  const eventsByMonth = useMemo(() => {
    const grouped = {};
    months.forEach((_, i) => { grouped[i] = []; });
    getFilteredEvents.forEach(e => {
      if (e.monthIndex >= 0 && e.monthIndex <= 11) grouped[e.monthIndex].push(e);
    });
    // stable order: by monthIndex already; inside month, try to bubble “deadline/close” higher
    Object.values(grouped).forEach(list => {
      list.sort((a,b) => {
        const pa = /deadline|closes/i.test(a.title) ? -1 : 0;
        const pb = /deadline|closes/i.test(b.title) ? -1 : 0;
        return pa - pb;
      });
    });
    return grouped;
  }, [getFilteredEvents]);

  // beeswarm offsets to prevent overlap (top 3 shown, symmetric spacing)
  const DY = 28;           // vertical spacing per step
  const MAX_VISIBLE = 3;   // show up to 3; rest go behind “+N more”
  const beeswarmOffsets = (n) => {
    const seq = [0];
    for (let i=1; seq.length<n; i++) seq.push(i, -i);
    return seq.slice(0, n).map(step => step * DY);
  };

  // column height based on busiest month (only visible rows)
  const monthColHeight = useMemo(() => {
    const counts = Object.values(eventsByMonth).map(arr => Math.min(arr.length, MAX_VISIBLE));
    const maxRows = Math.max(1, ...counts);
    const base = 56; // enough for one row above the rail
    return base + (maxRows - 1) * DY + 8;
  }, [eventsByMonth]);

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
      {!isCompact && <div className="text-muted-foreground mt-1">{event.date}</div>}
    </motion.div>
  );

  const CompactTimeline = () => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-primary mb-2">Academic Year Timeline</h3>
        <p className="text-muted-foreground">Click anywhere on the timeline to explore details</p>
      </div>

      {/* Year Carousel Controls */}
      <div className="flex items-center justify-center mb-6">
        <Button variant="ghost" size="icon" onClick={handlePrevYear} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <motion.div
          key={currentYear}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.3 }}
          className="mx-8 min-w-[80px] text-center"
        >
          <div className="text-lg font-semibold text-primary">{currentYear}</div>
        </motion.div>

        <Button variant="ghost" size="icon" onClick={handleNextYear} className="text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <motion.div
        key={`timeline-${currentYear}`}
        initial={{ opacity: 0, x: direction * 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative cursor-pointer hover:bg-muted/20 p-4 rounded-lg transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        {/* Events above timeline */}
        <div className="mb-6 relative" style={{ height: monthColHeight }}>
          {months.map((month, index) => {
            const list = eventsByMonth[index] || [];
            const visible = list.slice(0, MAX_VISIBLE);
            const hiddenCount = Math.max(0, list.length - MAX_VISIBLE);
            const offsets = beeswarmOffsets(visible.length);
            return (
              <div
                key={month}
                className="absolute bottom-0 left-0"
                style={{ left: `${(index / 11) * 100}%`, transform: 'translateX(-50%)' }}
              >
                <div className="relative flex flex-col-reverse items-center">
                  {visible.map((event, i) => (
                    <motion.div
                      key={event.id}
                      className="w-28"
                      style={{ marginBottom: offsets[i] }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 + i * 0.02 }}
                    >
                      <TimelineEvent event={event} />
                    </motion.div>
                  ))}

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      className="absolute -top-5 translate-x-1/2 right-1/2 text-[11px] underline text-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusMonth(index);
                        setIsExpanded(true);
                      }}
                    >
                      +{hiddenCount} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline rail */}
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
      </motion.div>
    </div>
  );

  const ExpandedTimeline = () => {
    const containerRef = useRef(null);

    // scroll to focused month (from "+N more") after open
    useEffect(() => {
      if (focusMonth == null) return;
      const el = document.getElementById(`month-${focusMonth}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, [focusMonth]);

    // sorted by month, then title
    const sorted = useMemo(
      () =>
        [...getFilteredEvents].sort((a, b) => {
          if (a.monthIndex !== b.monthIndex) return a.monthIndex - b.monthIndex;
          return String(a.title).localeCompare(String(b.title));
        }),
      [getFilteredEvents]
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background z-50 overflow-y-auto"
        ref={containerRef}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-primary">
              Academic Year {currentYear === 'All' ? '2024–2026' : currentYear} Timeline
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsExpanded(false);
                setFocusMonth(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Year Carousel Controls in Expanded View */}
          <div className="flex items-center justify-center mb-8">
            <Button variant="ghost" size="icon" onClick={handlePrevYear} className="text-muted-foreground hover:text-foreground">
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

            <Button variant="ghost" size="icon" onClick={handleNextYear} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Sectioned by month with anchors for smooth scroll */}
          {months.map((m, idx) => {
            const monthItems = sorted.filter(e => e.monthIndex === idx);
            if (!monthItems.length) return null;
            return (
              <div key={m} id={`month-${idx}`} className="mb-8">
                <h3 className="text-lg font-semibold text-primary mb-3">{m}</h3>
                <motion.div
                  key={`expanded-events-${currentYear}-${idx}`}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {monthItems.map((event, eventIndex) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: eventIndex * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{event.title}</h4>
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                          {event.month}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{event.date}</div>
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{event.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const EventModal = () => {
    if (!selectedEvent) return null;
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
                <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>{selectedEvent.date}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><span>{selectedEvent.time}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{selectedEvent.location}</span></div>
              </div>

              <p className="text-foreground leading-relaxed">{selectedEvent.description}</p>
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
