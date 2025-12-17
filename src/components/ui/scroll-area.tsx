import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>

    {/* Always-visible, more prominent custom scrollbar */}
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors transition-opacity opacity-100 pointer-events-auto group data-[state=hidden]:!opacity-100 data-[state=hidden]:!translate-x-0 data-[state=hidden]:!translate-y-0",
      // Make the scrollbar slightly wider so it's clearly visible
      // Add a subtle track background that differs from the editor/preview background
      // The 'group' class allows us to change the thumb's color when the pointer is over the scrollbar
      orientation === "vertical" &&
        "h-full w-3 p-[2px] bg-muted/20 dark:bg-muted/60 rounded-md",
      orientation === "horizontal" &&
        "h-3 flex-col w-full p-[2px] bg-muted/20 dark:bg-muted/60 rounded-md",
      className
    )}
    {...props}
  >
    {/* Thumb - dark grey in light theme, slightly lighter in dark theme; visible at all times */}
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-primary/90 dark:bg-primary/70 hover:bg-primary/90 dark:hover:bg-primary/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 opacity-100 translate-x-0 translate-y-0 data-[state=hidden]:!opacity-100 data-[state=hidden]:!translate-x-0 data-[state=hidden]:!translate-y-0" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
