import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { format, parseISO, compareAsc } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, X, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const BestTimeGrid = ({
  slots,
  userChoices,
  onToggleSlot,
  onClearAllChoices,
  slotLookup = {},
  tallies = []
}) => {
  const gridRef = useRef(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // --- lookups / keys ---
  const slotById = useMemo(() => {
    const m = {};
    for (const s of slots) m[s.slot_id] = s;
    return m;
  }, [slots]);

  const dateKeys = useMemo(
    () => [...new Set(slots.map((s) => s.date))].sort((a, b) => compareAsc(parseISO(a), parseISO(b))),
    [slots]
  );

  const times = useMemo(
    () => [...new Set(slots.map((s) => s.start_time))].filter(time => time !== '09:00').sort(),
    [slots]
  );

  const slotByDateTime = useMemo(() => {
    const m = {};
    slots.forEach((slot) => (m[`${slot.date}-${slot.start_time}`] = slot));
    return m;
  }, [slots]);

  const selectedSlots = useMemo(() => {
    return userChoices
      .map((id) => slotById[id])
      .filter(Boolean)
      .sort((a, b) => {
        const d = compareAsc(parseISO(a.date), parseISO(b.date));
        if (d !== 0) return d;
        return a.start_time.localeCompare(b.start_time);
      });
  }, [userChoices, slotById]);

  const topPicks = useMemo(() => {
    const arr = (tallies || [])
      .filter((t) => (t.choice_count || 0) > 0)
      .sort((a, b) => (b.choice_count || 0) - (a.choice_count || 0))
      .slice(0, 3)
      .map((t, i) => ({
        rank: i + 1,
        count: t.choice_count || 0,
        slot: slotById[t.slot_id],
      }));
    return arr.filter((p) => p.slot);
  }, [tallies, slotById]);

  // --- interactions ---
  const handleCellClick = useCallback(
    (slot) => onToggleSlot(slot.slot_id),
    [onToggleSlot]
  );

  const handleCellHover = useCallback((event, slot) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setHoveredSlot(slot);
  }, []);

  const handleCellLeave = useCallback(() => setHoveredSlot(null), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gridRef.current) return;
      if (e.key === 'Escape') onClearAllChoices();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClearAllChoices]);

  // ================= LAYOUT =================
  // Just the grid component without sidebar
  return (
    <div className="w-full">
      <main className="w-full">
        <Card>
          {/* ultra-compact header (remove extra blocks above the grid) */}
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              Multi-Select Time Grid
            </CardTitle>
            <CardDescription className="text-xs">
              Click to select/deselect. Choose multiple slots.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="relative">
              {/* Grid container (shorter height + narrower columns to avoid scrolling) */}
              <div
                ref={gridRef}
                className="overflow-auto scroll-smooth"
                style={{
                  maxHeight: '42vh',                 // reduced height
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
                }}
              >
                <div className="relative min-w-fit">
                  {/* Header Row (Dates) */}
                  <div className="sticky top-0 z-20 bg-background border-b flex">
                    {/* top-left corner */}
                    <div className="sticky left-0 z-30 bg-background border-r border-b w-10 h-7 flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>

                    {/* Date headers (narrower) */}
                    {dateKeys.map((date) => (
                      <div
                        key={date}
                        className="w-14 h-7 flex flex-col items-center justify-center border-r text-[11px] font-medium bg-muted/50"
                      >
                        <div>{format(parseISO(date), 'EEE')}</div>
                        <div className="text-muted-foreground">{format(parseISO(date), 'M/d')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Grid Rows (shorter row height) */}
                  {times.map((time) => (
                    <div key={time} className="flex">
                      {/* Time label (sticky) */}
                      <div className="sticky left-0 z-10 bg-background border-r w-10 h-5 flex items-center justify-center text-[11px] font-medium bg-muted/30">
                        {time}
                      </div>

                      {/* Cells across dates */}
                      {dateKeys.map((date) => {
                        const slot = slotByDateTime[`${date}-${time}`];

                        if (!slot) {
                          return <div key={`${date}-${time}`} className="w-14 h-5 border-r border-b bg-muted/10" />;
                        }

                        const tally = slotLookup[slot.slot_id];
                        const isSelected = userChoices.includes(slot.slot_id);
                        const choiceCount = tally?.choice_count || 0;

                        return (
                       <div
  key={slot.slot_id}
  className={cn(
    'w-14 h-[18px] border-r border-b cursor-pointer relative transition-all duration-150',
    'hover:scale-[1.03] hover:z-10',
    (() => {
      const c = Number(choiceCount) || 0;
      if (c === 0) return 'bg-muted/20';
      const allCounts = tallies.map(t => Number(t.choice_count) || 0).filter(n => n > 0);
      const unique = [...new Set(allCounts)].sort((a, b) => b - a);
      if (unique.length === 0) return 'bg-muted/20';
      if (unique.length === 1) return 'bg-green-600';
      const [highest, secondHighest] = unique;
      if (c === highest) return 'bg-green-600';
      if (c === secondHighest) return 'bg-green-400';
      return 'bg-green-200';
    })(),
    isSelected && 'ring-2 ring-primary ring-inset'
  )}
  onClick={() => handleCellClick(slot)}
  onMouseEnter={(e) => handleCellHover(e, slot)}
  onMouseLeave={handleCellLeave}
>
  {Number(choiceCount) > 0 && (
    <div className="absolute top-0 right-0 bg-background/90 text-primary text-[10px] font-medium px-1 rounded min-w-[12px] text-center leading-none">
      {choiceCount}
    </div>
  )}
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
                  className="fixed z-50 bg-popover text-popover-foreground p-2.5 rounded-md shadow-lg border max-w-xs"
                  style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="font-medium mb-1 text-sm">
                    {format(parseISO(hoveredSlot.date), 'MMM d')} at {hoveredSlot.start_time}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Choices:</span>
                      <span>{slotLookup[hoveredSlot.slot_id]?.choice_count || 0}</span>
                    </div>
                    {userChoices.includes(hoveredSlot.slot_id) && (
                      <div className="text-primary mt-1 font-medium">✓ You selected this</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-green-600 border rounded" />
                <span>Most Votes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-green-400 border rounded" />
                <span>Second Most</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-green-200 border rounded" />
                <span>Fewest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-muted/20 border rounded" />
                <span>No Votes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 ring-2 ring-primary border rounded" />
                <span>Your Selections</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BestTimeGrid;
