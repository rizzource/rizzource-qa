import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const MONTHS = ["AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY"];

// Exactly 10 mock events (titles match the style in your screenshot)
const mockEvents = [
  { id: 1, month: "AUG", title: "Orientation", category: "academic" },
  { id: 2, month: "SEP", title: "Career Services Kickoff", category: "jobsearch" },
  { id: 3, month: "OCT", title: "Midterms", category: "academic" },
  { id: 4, month: "OCT", title: "Career Services Events", category: "jobsearch" },
  { id: 5, month: "NOV", title: "Outline Workshop", category: "academic" },
  { id: 6, month: "DEC", title: "Final Exams", category: "important" },
  { id: 7, month: "JAN", title: "Mock Interview Program (Virtual)", category: "jobsearch" },
  { id: 8, month: "FEB", title: "February Interview Program", category: "jobsearch" },
  { id: 9, month: "MAR", title: "March Interview Program", category: "jobsearch" },
  { id: 10, month: "APR", title: "EPIC Grants Deadline", category: "important" },
];

const groupByMonth = (events) =>
  MONTHS.reduce((acc, m) => {
    acc[m] = events.filter((e) => e.month === m);
    return acc;
  }, {});

export default function TimelineScreenshotMatch() {
  const [hovered, setHovered] = useState(null);
  const [view, setView] = useState("academic"); // purely visual, like screenshot
  const byMonth = useMemo(() => groupByMonth(mockEvents), []);

  return (
    <div className="w-full">
      {/* TIMELINE */}
      <div className="relative max-w-5xl mx-auto pt-8 pb-10">
        {/* line */}
        <div className="relative h-[2px] bg-amber-700/80 rounded-full" />

        {/* months & dots */}
        <div className="relative">
          {MONTHS.map((m, i) => {
            const left = `${(i / (MONTHS.length - 1)) * 100}%`;
            const items = byMonth[m] || [];
            const isHovered = hovered === i;

            return (
              <div
                key={m}
                className="absolute top-0 left-0 -translate-x-1/2"
                style={{ left }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* dot */}
                <div className="h-[6px] w-[6px] rounded-full bg-foreground/70 translate-y-[-2px]" />

                {/* month label */}
                <div className="mt-4 text-[11px] tracking-[0.08em] text-foreground/90 text-center">
                  <span
                    className={`px-1.5 py-0.5 rounded-md ${
                      isHovered ? "bg-muted shadow-sm border border-border" : ""
                    }`}
                  >
                    {m}
                  </span>
                </div>

                {/* hover card */}
                {isHovered && items.length > 0 && (
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2">
                    <div className="w-56 rounded-lg border border-border bg-card shadow-md p-3">
                      <div className="text-sm font-semibold mb-2">{toTitle(m)}</div>
                      <ul className="space-y-1 text-[12px] text-foreground/90">
                        {items.map((e) => (
                          <li key={e.id} className="flex gap-2">
                            <span className="mt-[6px] h-[3px] w-[3px] rounded-full bg-foreground/80" />
                            <span>{e.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* center tick for year divider between DEC and JAN (thin & subtle) */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[2px] w-[2px] bg-foreground/30" />
      </div>

      {/* TOGGLE (visual, like screenshot) */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center bg-muted rounded-full p-1">
          <Button
            size="sm"
            variant={view === "academic" ? "default" : "ghost"}
            className={view === "academic" ? "bg-foreground text-background hover:bg-foreground/90" : "text-foreground/80"}
            onClick={() => setView("academic")}
          >
            Academic Events
          </Button>
          <Button
            size="sm"
            variant={view === "jobsearch" ? "default" : "ghost"}
            className={view === "jobsearch" ? "bg-amber-600 text-background hover:bg-amber-600/90" : "text-foreground/80"}
            onClick={() => setView("jobsearch")}
          >
            Job Search Events
          </Button>
        </div>
      </div>

      {/* YEAR label below toggle */}
      <div className="mt-3 text-center text-sm text-foreground/70">2025</div>
    </div>
  );
}

function toTitle(m) {
  // "OCT" -> "October"
  const map = {
    AUG: "August",
    SEP: "September",
    OCT: "October",
    NOV: "November",
    DEC: "December",
    JAN: "January",
    FEB: "February",
    MAR: "March",
    APR: "April",
    MAY: "May",
  };
  return map[m] ?? m;
}
