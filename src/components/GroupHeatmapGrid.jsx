import { useState } from 'react';
import { format } from 'date-fns';

const GroupHeatmapGrid = ({ 
  dates, 
  timeSlots, 
  heatmapData,
  title = "Group Availability" 
}) => {
  const [hoveredSlot, setHoveredSlot] = useState(null);

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

  const getHeatmapColor = (percentage) => {
    if (percentage === 0) return 'bg-muted';
    if (percentage <= 25) return 'bg-red-200 dark:bg-red-900/30';
    if (percentage <= 50) return 'bg-yellow-200 dark:bg-yellow-900/30';
    if (percentage <= 75) return 'bg-green-200 dark:bg-green-900/30';
    return 'bg-green-400 dark:bg-green-600';
  };

  const getTooltipContent = (date, time) => {
    const data = heatmapData[date]?.[time];
    if (!data) return `${formatDate(date)} at ${time} - No data`;
    
    return `${formatDate(date)} at ${time}\n${data.availableCount} of ${data.totalParticipants} available (${data.percentage}%)`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
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
                
                {/* Heatmap slots for each date */}
                {dates.map(date => {
                  const data = heatmapData[date]?.[time] || { availableCount: 0, totalParticipants: 0, percentage: 0 };
                  const slotKey = `${date}-${time}`;
                  
                  return (
                    <div
                      key={slotKey}
                      className={`
                        h-6 border border-border transition-all duration-150 relative
                        ${getHeatmapColor(data.percentage)}
                        hover:scale-105 hover:border-foreground/40
                      `}
                      onMouseEnter={() => setHoveredSlot(slotKey)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      {/* Tooltip */}
                      {hoveredSlot === slotKey && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                          <div className="bg-popover text-popover-foreground text-xs p-2 rounded border border-border shadow-lg whitespace-pre">
                            {getTooltipContent(date, time)}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
                        </div>
                      )}
                      
                      {/* Percentage text for higher availability */}
                      {data.percentage > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-foreground/80">
                            {Math.round(data.percentage)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium">Availability:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted border border-border"></div>
            <span>0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 dark:bg-red-900/30 border border-border"></div>
            <span>1-25%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/30 border border-border"></div>
            <span>26-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 dark:bg-green-900/30 border border-border"></div>
            <span>51-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 dark:bg-green-600 border border-border"></div>
            <span>76-100%</span>
          </div>
          <span className="ml-auto">Hover for details</span>
        </div>
      </div>
    </div>
  );
};

export default GroupHeatmapGrid;