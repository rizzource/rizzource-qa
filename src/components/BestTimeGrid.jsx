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
  getIntensityColor,
  tallies = []
}) => {
  const gridRef = useRef(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Lookups and sorted keys
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
    () => [...new Set(slots.map((s) => s.start_time))].sort(),
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

  const handleCellClick = useCallback(
    (slot) => {
      onToggleSlot(slot.slot_id);
    },
    [onToggleSlot]
  );

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

  // Keyboard: ESC clears selections
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gridRef.current) return;
      if (e.key === 'Escape') onClearAllChoices();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClearAllChoices]);

  // ----- LAYOUT: right sidebar (Your Selections + Top Picks) beside grid on desktop -----
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Right sidebar (mobile first: on top). On desktop it moves to the right */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 lg:order-2 space-y-4">
        {/* Your Selections */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Selections ({selectedSlots.length})
            </CardTitle>
            <CardDescription>Select multiple time slots; click again to deselect.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSlots.length === 0 ? (
              <div className="text-sm text-muted-foreground">No selections yet.</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((s) => (
                    <button
                      key={s.slot_id}
                      onClick={() => onToggleSlot(s.slot_id)}
                      className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm bg-background hover:bg-muted transition"
                      title="Click to remove"
                    >
                      {format(parseISO(s.date), 'MMM d')} at {s.start_time}
                      <X className="h-3.5 w-3.5 opacity-70" />
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <Button variant="ghost" size="sm" onClick={onClearAllChoices} className="text-red-600 hover:text-red-700">
                    Clear all
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Picks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Picks ({topPicks.length})
            </CardTitle>
            <CardDescription>Most popular time slots (by vote count).</CardDescription>
          </CardHeader>
          <CardContent>
            {topPicks.length === 0 ? (
              <div className="text-sm text-muted-foreground">No votes yet.</div>
            ) : (
              <div className="grid gap-3">
                {topPicks.map(({ rank, count, slot }) => (
                  <div
                    key={slot.slot_id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-semibold">
                        {rank}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{format(parseISO(slot.date), 'MMM d')} at {slot.start_time}</div>
                        <div className="text-xs text-muted-foreground">Rank #{rank}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-background border">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Main grid */}
      <main className="col-span-12 lg:col-span-8 xl:col-span-9 lg:order-1">
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
                    {dateKeys.map((date) => (
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
                  {times.map((time) => (
                    <div key={time} className="flex">
                      {/* Time label (sticky left column) */}
                      <div className="sticky left-0 z-10 bg-background border-r w-12 h-6 flex items-center justify-center text-xs font-medium bg-muted/30">
                        {time}
                      </div>

                      {/* Cells for this time across all dates */}
                      {dateKeys.map((date) => {
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
                              'w-16 h-6 border-r border-b cursor-pointer relative group transition-all duration-150',
                              'hover:scale-105 hover:z-10 hover:shadow-sm',
                              'active:scale-95',
                              (() => {
                                const c = Number(choiceCount) || 0;
                                if (c === 0) return 'bg-muted/20'; // No votes - neutral

                                const allCounts = tallies
                                  .map((t) => Number(t.choice_count) || 0)
                                  .filter((n) => n > 0);
                                const uniqueCounts = [...new Set(allCounts)].sort((a, b) => b - a);

                                if (uniqueCounts.length === 0) return 'bg-muted/20';
                                if (uniqueCounts.length === 1) return 'bg-emerald-600'; // only one level

                                const highest = uniqueCounts[0];
                                const secondHighest = uniqueCounts[1];

                                if (c === highest) return 'bg-emerald-600';
                                if (c === secondHighest) return 'bg-emerald-400';
                                return 'bg-emerald-200';
                              })(),
                              isSelected && 'ring-2 ring-primary ring-inset'
                            )}
                            onClick={() => handleCellClick(slot)}
                            onMouseEnter={(e) => handleCellHover(e, slot)}
                            onMouseLeave={handleCellLeave}
                          >
                            {Number(choiceCount) > 0 && (
                              <div className="absolute top-0 right-0 bg-background/90 text-primary text-xs font-medium px-1 rounded min-w-[12px] text-center leading-none">
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
                      <div className="text-xs text-primary mt-2 font-medium">✓ You selected this</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-600 border rounded" />
                <span>Most Votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-400 border rounded" />
                <span>Second Most Votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-200 border rounded" />
                <span>Fewest Votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted/20 border rounded" />
                <span>No Votes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 ring-2 ring-primary border rounded" />
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
