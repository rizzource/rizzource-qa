import { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Trophy, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const CompactGridPoll = ({ slots, userVotes, onVote, getConsensusColor, getUserVoteBorder, getTopPicks }) => {
  const gridRef = useRef(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate unique dates and times from slots
  const dates = [...new Set(slots.map(slot => slot.date))].sort();
  const times = [...new Set(slots.map(slot => slot.start_time))].sort();
  
  // Create a lookup for quick slot access
  const slotLookup = {};
  slots.forEach(slot => {
    const key = `${slot.date}-${slot.start_time}`;
    slotLookup[key] = slot;
  });

  const topPicks = getTopPicks();

  const scrollToSlot = useCallback((date, startTime) => {
    if (!gridRef.current) return;
    
    const dateIndex = dates.indexOf(date);
    const timeIndex = times.indexOf(startTime);
    
    if (dateIndex >= 0 && timeIndex >= 0) {
      const cellWidth = 80; // Approximate cell width
      const cellHeight = 32; // Cell height
      const scrollLeft = dateIndex * cellWidth;
      const scrollTop = timeIndex * cellHeight;
      
      gridRef.current.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [dates, times]);

  const handleCellClick = useCallback((slot) => {
    onVote(slot.slot_id);
  }, [onVote]);

  const handleCellHover = useCallback((event, slot) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredSlot(slot);
  }, []);

  const handleCellLeave = useCallback(() => {
    setHoveredSlot(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gridRef.current) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        // TODO: Implement keyboard navigation if needed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Picks */}
      {topPicks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-accent" />
              Top Picks Right Now
            </CardTitle>
            <CardDescription>
              Click a chip to jump to that time slot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topPicks.map((slot, index) => (
                <Button
                  key={slot.slot_id}
                  variant={index === 0 ? "default" : "secondary"}
                  size="sm"
                  onClick={() => scrollToSlot(slot.date, slot.start_time)}
                  className="h-8 text-xs"
                >
                  {index === 0 && <Trophy className="h-3 w-3 mr-1" />}
                  {format(parseISO(slot.date), 'MMM d')} {slot.start_time}
                  <Badge variant="outline" className="ml-2 h-4 text-xs">
                    {slot.score}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            September 11-21 Poll Grid
          </CardTitle>
          <CardDescription>
            Tap cells to vote: NO → MAYBE → YES → NO. Colors show group consensus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Grid Container */}
            <div
              ref={gridRef}
              className="overflow-auto scroll-smooth"
              style={{ 
                maxHeight: '60vh',
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
              }}
            >
              <div className="relative min-w-fit">
                {/* Header Row (Dates) */}
                <div className="sticky top-0 z-20 bg-background border-b flex">
                  {/* Top-left corner */}
                  <div className="sticky left-0 z-30 bg-background border-r border-b w-16 h-10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {/* Date headers */}
                  {dates.map(date => (
                    <div
                      key={date}
                      className="w-20 h-10 flex flex-col items-center justify-center border-r text-xs font-medium bg-muted/50"
                    >
                      <div>{format(parseISO(date), 'EEE')}</div>
                      <div className="text-xs text-muted-foreground">{format(parseISO(date), 'MMM d')}</div>
                    </div>
                  ))}
                </div>

                {/* Grid Rows */}
                {times.map(time => (
                  <div key={time} className="flex">
                    {/* Time label (sticky left column) */}
                    <div className="sticky left-0 z-10 bg-background border-r w-16 h-8 flex items-center justify-center text-xs font-medium bg-muted/30">
                      {time}
                    </div>
                    
                    {/* Cells for this time across all dates */}
                    {dates.map(date => {
                      const slotKey = `${date}-${time}`;
                      const slot = slotLookup[slotKey];
                      
                      if (!slot) {
                        return (
                          <div
                            key={`${date}-${time}`}
                            className="w-20 h-8 border-r border-b bg-muted/10"
                          />
                        );
                      }

                      return (
                        <div
                          key={slot.slot_id}
                          className={cn(
                            "w-20 h-8 border-r border-b cursor-pointer relative group transition-all duration-150",
                            "hover:scale-105 hover:z-10 hover:shadow-sm",
                            "active:scale-95",
                            // Add touch target padding on mobile
                            "md:p-0 p-1",
                            getConsensusColor(slot),
                            getUserVoteBorder(slot.slot_id)
                          )}
                          onClick={() => handleCellClick(slot)}
                          onMouseEnter={(e) => handleCellHover(e, slot)}
                          onMouseLeave={handleCellLeave}
                          style={{ minHeight: '44px' }} // Mobile tap target
                        >
                          {/* Vote counts badge */}
                          {(slot.yes_count > 0 || slot.maybe_count > 0 || slot.no_count > 0) && (
                            <div className="absolute top-0 right-0 flex items-center gap-0.5 text-xs leading-none p-0.5 bg-background/80 rounded-bl">
                              {slot.yes_count > 0 && (
                                <span className="text-green-600">✅{slot.yes_count}</span>
                              )}
                              {slot.maybe_count > 0 && (
                                <span className="text-yellow-600">🤔{slot.maybe_count}</span>
                              )}
                              {slot.no_count > 0 && (
                                <span className="text-muted-foreground">❌{slot.no_count}</span>
                              )}
                            </div>
                          )}

                          {/* Current user vote indicator */}
                          {userVotes[slot.slot_id] && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/60" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip */}
            {hoveredSlot && (
              <div
                className="fixed z-50 bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs"
                style={{
                  left: tooltipPosition.x,
                  top: tooltipPosition.y,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="font-medium mb-1">
                  {format(parseISO(hoveredSlot.date), 'MMM d')} at {hoveredSlot.start_time}
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>✅ Yes:</span>
                    <span>{hoveredSlot.yes_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🤔 Maybe:</span>
                    <span>{hoveredSlot.maybe_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>❌ No:</span>
                    <span>{hoveredSlot.no_count}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Score:</span>
                    <span>{hoveredSlot.score}</span>
                  </div>
                </div>
                {userVotes[hoveredSlot.slot_id] && (
                  <div className="text-xs text-primary mt-2">
                    Your vote: {userVotes[hoveredSlot.slot_id].toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded" />
              <span>Strong Yes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/40 rounded" />
              <span>Mixed/Maybe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted border border-muted-foreground/20 rounded" />
              <span>Low Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary rounded" />
              <span>Your YES vote</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-dashed border-primary rounded" />
              <span>Your MAYBE vote</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactGridPoll;