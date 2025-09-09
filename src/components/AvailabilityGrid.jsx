import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';

const AvailabilityGrid = ({ 
  dates, 
  timeSlots, 
  availability, 
  onToggle, 
  onRangeSelect,
  title = "Your Availability" 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'
  const gridRef = useRef(null);

  const handleMouseDown = useCallback((date, time, e) => {
    e.preventDefault();
    const currentStatus = availability[date]?.[time] || false;
    const newMode = !currentStatus ? 'select' : 'deselect';
    
    setIsDragging(true);
    setDragStart({ date, time });
    setDragMode(newMode);
    onToggle(date, time);
  }, [availability, onToggle]);

  const handleMouseEnter = useCallback((date, time) => {
    if (!isDragging || !dragStart) return;
    
    // Only allow dragging within the same date
    if (date !== dragStart.date) return;
    
    const startIndex = timeSlots.indexOf(dragStart.time);
    const endIndex = timeSlots.indexOf(time);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    // Apply the drag mode to the range
    for (let i = minIndex; i <= maxIndex; i++) {
      const currentTime = timeSlots[i];
      const currentStatus = availability[date]?.[currentTime] || false;
      const shouldBeAvailable = dragMode === 'select';
      
      if (currentStatus !== shouldBeAvailable) {
        onToggle(date, currentTime);
      }
    }
  }, [isDragging, dragStart, dragMode, timeSlots, availability, onToggle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragMode(null);
  }, []);

  // Add global mouse up listener
  useState(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

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
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${period}`;
    } catch {
      return time;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-max" ref={gridRef}>
          {/* Header with dates */}
          <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `80px repeat(${dates.length}, 120px)` }}>
            <div></div>
            {dates.map(date => (
              <div key={date} className="text-center text-sm font-medium text-foreground p-2">
                {formatDate(date)}
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          <div className="space-y-1">
            {timeSlots.map((time, timeIndex) => (
              <div key={time} className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${dates.length}, 120px)` }}>
                {/* Time label - only show for every 4th slot (hourly) */}
                <div className="text-right text-xs text-muted-foreground pr-2 py-1">
                  {timeIndex % 4 === 0 ? formatTime(time) : ''}
                </div>
                
                {/* Availability slots for each date */}
                {dates.map(date => {
                  const isAvailable = availability[date]?.[time] || false;
                  
                  return (
                    <div
                      key={`${date}-${time}`}
                      className={`
                        h-6 border border-border cursor-pointer transition-colors duration-150
                        ${isAvailable 
                          ? 'bg-primary hover:bg-primary/80' 
                          : 'bg-muted hover:bg-muted/80'
                        }
                        ${isDragging ? 'select-none' : ''}
                      `}
                      onMouseDown={(e) => handleMouseDown(date, time, e)}
                      onMouseEnter={() => handleMouseEnter(date, time)}
                      title={`${formatDate(date)} at ${time} - ${isAvailable ? 'Available' : 'Not available'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary border border-border"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted border border-border"></div>
            <span>Not available</span>
          </div>
          <span className="ml-auto">Click and drag to select time ranges</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityGrid;