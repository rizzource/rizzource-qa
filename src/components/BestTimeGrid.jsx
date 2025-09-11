import { useState, useRef, useCallback, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const BestTimeGrid = ({ 
  slots, 
  userChoices, 
  onToggleSlot, 
  onClearAllChoices,
  slotLookup, 
  getIntensityColor,
  tallies 
}) => {
  const gridRef = useRef(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate unique dates and times from slots
  const dates = [...new Set(slots.map(slot => slot.date))].sort();
  const times = [...new Set(slots.map(slot => slot.start_time))].sort();
  
  // Create a lookup for quick slot access
  const slotByDateTime = {};
  slots.forEach(slot => {
    const key = `${slot.date}-${slot.start_time}`;
    slotByDateTime[key] = slot;
  });

  const handleCellClick = useCallback((slot) => {
    onToggleSlot(slot.slot_id);
  }, [onToggleSlot]);

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
      
      if (e.key === 'Escape') {
        onClearAllChoices();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClearAllChoices]);

  return (
    <div className="space-y-4">
      {/* Clear Choices Button */}
      {userChoices.length > 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAllChoices}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Choices ({userChoices.length})
          </Button>
        </div>
      )}

      {/* Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Select Time Grid
          </CardTitle>
          <CardDescription>
            Click cells to select/deselect your preferred times. You can choose multiple slots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Grid Container */}
            <div
              ref={gridRef}
              className="overflow-auto scroll-smooth"
              style={{ 
                maxHeight: '50vh',
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
              }}
            >
              <div className="relative min-w-fit">
                {/* Header Row (Dates) */}
                <div className="sticky top-0 z-20 bg-background border-b flex">
                  {/* Top-left corner */}
                  <div className="sticky left-0 z-30 bg-background border-r border-b w-12 h-8 flex items-center justify-center">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  
                  {/* Date headers */}
                  {dates.map(date => (
                    <div
                      key={date}
                      className="w-16 h-8 flex flex-col items-center justify-center border-r text-xs font-medium bg-muted/50"
                    >
                      <div className="text-xs">{format(parseISO(date), 'EEE')}</div>
                      <div className="text-xs text-muted-foreground">{format(parseISO(date), 'M/d')}</div>
                    </div>
                  ))}
                </div>

                {/* Grid Rows */}
                {times.map(time => (
                  <div key={time} className="flex">
                    {/* Time label (sticky left column) */}
                    <div className="sticky left-0 z-10 bg-background border-r w-12 h-6 flex items-center justify-center text-xs font-medium bg-muted/30">
                      {time}
                    </div>
                    
                    {/* Cells for this time across all dates */}
                    {dates.map(date => {
                      const slotKey = `${date}-${time}`;
                      const slot = slotByDateTime[slotKey];
                      
                      if (!slot) {
                        return (
                          <div
                            key={`${date}-${time}`}
                            className="w-16 h-6 border-r border-b bg-muted/10"
                          />
                        );
                      }

                      const tally = slotLookup[slot.slot_id];
                      const isSelected = userChoices.includes(slot.slot_id);
                      const choiceCount = tally?.choice_count || 0;

                      return (
                <div
  key={slot.slot_id}
  className={cn(
    // compact, fixed height; no transforms (prevents mobile misalignment on scroll)
    "w-14 sm:w-16 h-[14px] sm:h-[16px] border-r border-b cursor-pointer relative group",
    "p-0 leading-none select-none",
    "transition-[filter,background-color] duration-75 hover:brightness-105 active:brightness-95",
    // rank colors inline (darkest = highest count; medium = 2nd-highest; light = rest; 0 = muted)
    (() => {
      const counts = Object.values(tallies ?? {}).map(v => v?.count ?? 0);
      const uniqPos = Array.from(new Set(counts.filter(n => n > 0))).sort((a,b)=>b-a);
      const darkest = uniqPos[0] ?? 0;
      const medium  = uniqPos[1] ?? darkest;
      return choiceCount === 0
        ? "bg-muted"
        : choiceCount === darkest
        ? "bg-primary/70"
        : choiceCount === medium
        ? "bg-primary/45"
        : "bg-primary/25";
    })(),
    isSelected && "ring-1 ring-primary ring-inset"
  )}
  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
  onClick={() => handleCellClick(slot)}
  onMouseEnter={(e) => handleCellHover(e, slot)}
  onMouseLeave={handleCellLeave}
>
  {/* Count pill (non-interactive so scrolling doesn’t glitch) */}
  {choiceCount > 0 && (
    <div className="pointer-events-none absolute top-0.5 right-0.5 bg-background/90 text-primary text-[10px] font-medium px-0.5 rounded">
      {choiceCount}
    </div>
  )}
  {/* My selection underline */}
  {isSelected && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
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
                    <span>Choices:</span>
                    <span>{slotLookup[hoveredSlot.slot_id]?.choice_count || 0}</span>
                  </div>
                  {userChoices.includes(hoveredSlot.slot_id) && (
                    <div className="text-xs text-primary mt-2 font-medium">
                      ✓ You selected this
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/60 border rounded" />
              <span>High Interest (60%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 border rounded" />
              <span>Some Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 ring-2 ring-primary border rounded" />
              <span>Your selections</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BestTimeGrid;