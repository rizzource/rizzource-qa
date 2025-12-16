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
      "flex touch-none select-none transition-colors opacity-100 pointer-events-auto group",
      // Make the scrollbar slightly wider so it's clearly visible
      // Add a subtle track background that differs from the editor/preview background
      // The 'group' class allows us to change the thumb's color when the pointer is over the scrollbar
      orientation === "vertical" &&
        "h-full w-3 p-[2px] bg-muted/10 dark:bg-muted/30 rounded-md",
      orientation === "horizontal" &&
        "h-3 flex-col w-full p-[2px] bg-muted/10 dark:bg-muted/30 rounded-md",
      className
    )}
    {...props}
  >
    {/* Thumb - dark grey in light theme, slightly lighter in dark theme; turns black/dark-gray when pointer is over scrollbar */}
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-gray-700 dark:bg-gray-400 hover:bg-black dark:hover:bg-gray-600 group-hover:bg-black dark:group-hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
