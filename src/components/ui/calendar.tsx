import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: monthProp,
  onMonthChange,
  ...props
}) {
  // Control the visible month so our custom header and the calendar stay in sync
  const [month, setMonth] = React.useState(monthProp ?? new Date());
  React.useEffect(() => {
    if (monthProp) setMonth(monthProp);
  }, [monthProp]);

  const go = (delta) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    setMonth(next);
    onMonthChange?.(next);
  };

  const headerLabel = month.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm",
        className
      )}
    >
      {/* Custom header (replaces DayPicker's caption/nav entirely) */}
      <div className="relative mb-3 flex items-center justify-center">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => go(-1)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-0 h-8 w-8 rounded-full p-0 border-border hover:bg-accent/40"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-base font-semibold tracking-wide text-foreground">
          {headerLabel}
        </div>

        <button
          type="button"
          aria-label="Next month"
          onClick={() => go(1)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-0 h-8 w-8 rounded-full p-0 border-border hover:bg-accent/40"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <DayPicker
        month={month}
        onMonthChange={(m) => {
          setMonth(m);
          onMonthChange?.(m);
        }}
        showOutsideDays={showOutsideDays}
        // Hide built-in caption & nav so they can’t overlap the label
        classNames={{
          caption: "hidden",
          caption_label: "hidden",
          nav: "hidden",
          // Layout
          months:
            "flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0",
          month: "w-full space-y-4",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "w-10 text-center text-[0.75rem] font-medium text-muted-foreground",
          row: "flex w-full mt-1",
          cell:
            "relative h-10 w-10 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          // Days
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 w-10 p-0 rounded-full font-medium transition-all hover:bg-accent/40 hover:text-foreground aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary focus:bg-primary",
          day_today: "ring-2 ring-primary/60",
          day_outside:
            "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/40 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-primary/15 aria-selected:text-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        // Keep icon overrides available if DayPicker uses them elsewhere
        components={{
          IconLeft: (props) => <ChevronLeft className="h-4 w-4" {...props} />,
          IconRight: (props) => <ChevronRight className="h-4 w-4" {...props} />,
          // Remove DayPicker’s header entirely
          Caption: () => null,
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
