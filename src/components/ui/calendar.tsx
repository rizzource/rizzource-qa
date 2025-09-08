import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm",
        className
      )}
      classNames={{
        // Layout
        months: "flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0",
        month: "w-full space-y-4",

        // Centered title with built-in side padding so arrows never overlap
        caption: "relative flex items-center justify-center pt-1 pb-2 px-12",
        caption_label:
          "mx-2 text-base font-semibold tracking-wide text-foreground",

        // Place arrows at far left/right within caption, vertically centered
        nav: "pointer-events-none absolute inset-y-0 left-2 right-2 flex items-center justify-between",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "pointer-events-auto h-8 w-8 rounded-full p-0 bg-transparent border-border hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-primary/30"
        ),
        nav_button_previous: "",
        nav_button_next: "",

        // Table
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

        // Selected day = solid primary pill
        day_selected:
          "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary focus:bg-primary",

        // Today = subtle ring (works selected or not)
        day_today: "ring-2 ring-primary/60",

        // Outside-month days muted
        day_outside:
          "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/40 aria-selected:text-muted-foreground aria-selected:opacity-30",

        day_disabled: "text-muted-foreground opacity-50",

        // Range middle (if range mode) = soft tint
        day_range_middle:
          "aria-selected:bg-primary/15 aria-selected:text-foreground",

        day_hidden: "invisible",

        ...classNames,
      }}
      components={{
        IconLeft: (props) => <ChevronLeft className="h-4 w-4" {...props} />,
        IconRight: (props) => <ChevronRight className="h-4 w-4" {...props} />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
