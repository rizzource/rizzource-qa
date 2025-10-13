import { useState, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';

const AvailabilityGrid = ({
  dates,
  timeSlots,
  availability,
  onToggle,
  onRangeSelect,
  title = 'Your Availability',
  density = 'compact', // 'compact' | 'cozy' | 'comfortable'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragMode, setDragMode] = useState(null); // 'select' | 'deselect'
  const gridRef = useRef(null);

  // -------- Responsive sizing (smaller, When2Meet-like) --------
  const [sizes, setSizes] = useState({
    timeCol: 56,   // px
    col: 68,       // px
    row: 12,       // px (cell height)
    gap: 2,        // px
  });

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      // baseline per density
      const presets = {
        compact:      { timeCol: 48, col: 60, row: 10, gap: 2 },
        cozy:         { timeCol: 56, col: 68, row: 12, gap: 2 },
        comfortable:  { timeCol: 64, col: 80, row: 14, gap: 3 },
      }[density] || { timeCol: 56, col: 68, row: 12, gap: 2 };

      // scale up a bit on large screens, down on small
      if (w >= 1280) setSizes({ ...presets, col: presets.col + 8, row: presets.row + 2 });
      else if (w >= 1024) setSizes(presets);
      else if (w >= 768) setSizes({ ...presets, col: presets.col - 4 });
      else setSizes({ timeCol: presets.timeCol - 8, col: presets.col - 8, row: presets.row, gap: presets.gap });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [density]);

  const gridTemplate = {
    gridTemplateColumns: `${sizes.timeCol}px repeat(${dates.length}, ${sizes.col}px)`,
    gap: `${sizes.gap}px`,
  };

  // ---------- Drag (mouse) ----------
  const handleMouseDown = useCallback(
    (date, time, e) => {
      e.preventDefault();
      const currentStatus = availability[date]?.[time] || false;
      const newMode = !currentStatus ? 'select' : 'deselect';

      setIsDragging(true);
      setDragStart({ date, time });
      setDragMode(newMode);
      onToggle(date, time);
    },
    [availability, onToggle]
  );

  const handleMouseEnter = useCallback(
    (date, time) => {
      if (!isDragging || !dragStart) return;
      if (date !== dragStart.date) return;

      const startIndex = timeSlots.indexOf(dragStart.time);
      const endIndex = timeSlots.indexOf(time);
      if (startIndex === -1 || endIndex === -1) return;

      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);

      for (let i = minIndex; i <= maxIndex; i++) {
        const currentTime = timeSlots[i];
        const currentStatus = availability[date]?.[currentTime] || false;
        const shouldBeAvailable = dragMode === 'select';
        if (currentStatus !== shouldBeAvailable) onToggle(date, currentTime);
      }
    },
    [isDragging, dragStart, dragMode, timeSlots, availability, onToggle]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragMode(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // ---------- Touch support (mobile) ----------
  const handleTouchStart = (date, time, e) => {
    e.preventDefault();
    const currentStatus = availability[date]?.[time] || false;
    const newMode = !currentStatus ? 'select' : 'deselect';
    setIsDragging(true);
    setDragStart({ date, time });
    setDragMode(newMode);
    onToggle(date, time);
  };

  const handleTouchMove = (date, time, e) => {
    e.preventDefault();
    handleMouseEnter(date, time);
  };

  const handleTouchEnd = () => handleMouseUp();

  // ---------- Formatting ----------
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'EEE, MMM d');
    } catch {
      return dateString;
    }
  };

  const formatTime = (time) => {
    try {
      const [hours] = time.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${period}`;
    } catch {
      return time;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">{title}</h3>

      {/* Scrollable grid with sticky header/column */}
      <div className="relative max-h-[70vh] overflow-auto rounded-md select-none">
        <div className="min-w-max" ref={gridRef}>
          {/* Sticky date header row */}
          <div className="grid mb-2" style={gridTemplate}>
            <div className="sticky left-0 top-0 z-30 bg-card" />
            {dates.map((date) => (
              <div
                key={date}
                className="text-center text-[10px] sm:text-xs font-medium text-foreground p-1 sm:p-2 sticky top-0 z-20 bg-card"
              >
                {formatDate(date)}
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div className="space-y-[2px]">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className="grid" style={gridTemplate}>
                {/* Sticky time label (hourly) */}
                <div className="text-right text-[10px] sm:text-xs text-muted-foreground pr-2 py-1 sticky left-0 z-10 bg-card">
                  {timeIndex % 4 === 0 ? formatTime(time) : ''}
                </div>

                {/* Cells */}
                {dates.map((date) => {
                  const isAvailable = availability[date]?.[time] || false;
                  return (
                    <div
                      key={`${date}-${time}`}
                      className={`border border-border/40 cursor-pointer transition-colors duration-100
                        ${isAvailable ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/70'}
                      `}
                      style={{ height: `${sizes.row}px` }}
                      onMouseDown={(e) => handleMouseDown(date, time, e)}
                      onMouseEnter={() => handleMouseEnter(date, time)}
                      onTouchStart={(e) => handleTouchStart(date, time, e)}
                      onTouchMove={(e) => handleTouchMove(date, time, e)}
                      onTouchEnd={handleTouchEnd}
                      title={`${formatDate(date)} at ${time} — ${isAvailable ? 'Available' : 'Not available'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary border border-border/50" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-muted border border-border/50" />
            <span>Not available</span>
          </div>
          <span className="ml-auto hidden sm:block">Click/drag to select ranges (touch supported)</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityGrid;
