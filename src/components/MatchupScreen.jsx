import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Coffee,
  Clock,
  Copy,
  Download,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ----------------------- helpers ----------------------- */
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"]; const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const formatDisplay = (date) => {
  try {
    const d = new Date(date);
    const day = ordinal(d.getDate());
    const weekday = d.toLocaleString(undefined, { weekday: "long" });
    const month = d.toLocaleString(undefined, { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
    return { line1: `${time}`, line2: `${weekday} ${day} ${month}, ${year}` };
  } catch { return { line1: "", line2: "" }; }
};
// parses “3pm, Tuesday 12th Sep, 2025”
const parseMeetupTime = (meetupTime) => {
  const direct = new Date(meetupTime);
  if (!isNaN(direct.getTime())) return direct;
  const cleaned = meetupTime.replace(/(\d+)(st|nd|rd|th)/gi, "$1").replace(/,/g, "").trim();
  const re = /(?:(\d{1,2})(?::(\d{2}))?\s*(am|pm))?\s*(?:mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})/i;
  const m = cleaned.match(re);
  if (!m) return null;
  const [, hh = "9", mm = "00", ampm = "am", day, mon, year] = m;
  const monthMap = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
  let H = parseInt(hh, 10) % 12; if (ampm && ampm.toLowerCase() === "pm") H += 12;
  const d = new Date();
  d.setFullYear(parseInt(year, 10));
  d.setMonth(monthMap[mon.toLowerCase()]);
  d.setDate(parseInt(day, 10));
  d.setHours(H, parseInt(mm || "0", 10), 0, 0);
  return isNaN(d.getTime()) ? null : d;
};
const pad = (n) => String(n).padStart(2, "0");
const toICSDate = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const downloadICS = ({ title, description, start, end, location }) => {
  const dtStamp = toICSDate(new Date());
  const dtStart = toICSDate(start);
  const dtEnd = toICSDate(end);
  const body = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//RIZZource//Match//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@rizzource`,`DTSTAMP:${dtStamp}`,`DTSTART:${dtStart}`,`DTEND:${dtEnd}`,`SUMMARY:${title}`,
    location ? `LOCATION:${location}` : "", description ? `DESCRIPTION:${description.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT","END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = "meetup.ics"; a.click(); URL.revokeObjectURL(url);
};

/* -------------------- component -------------------- */
const MatchupScreen = ({
  mentorName = "Sher Khan",
  meetupTime = "3pm, Tuesday 12th Sep, 2025",
  activity = "coffee",
  selectedDates = ["Monday", "Wednesday"],      // <-- NEW: dates or days
  durationMinutes = 60,
  docHref = "#",
  docLabel = "General document (expectations of mentors and mentees)",
}) => {
  const startDate = useMemo(() => parseMeetupTime(meetupTime), [meetupTime]);
  const endDate = useMemo(() => (startDate ? new Date(startDate.getTime() + durationMinutes * 60000) : null), [startDate, durationMinutes]);
  const { line1, line2 } = startDate ? formatDisplay(startDate) : { line1: meetupTime, line2: "" };

  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!startDate) return;
    const tick = () => {
      const t = startDate.getTime() - Date.now();
      if (t <= 0) return setCountdown("Happening now");
      const d = Math.floor(t / (1000 * 60 * 60 * 24));
      const h = Math.floor((t / (1000 * 60 * 60)) % 24);
      const m = Math.floor((t / (1000 * 60)) % 60);
      setCountdown(`${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m" : ""}`);
    };
    tick(); const id = setInterval(tick, 60 * 1000); return () => clearInterval(id);
  }, [startDate]);

  const copyDetails = async () => {
    const text = `You’re matched with ${mentorName}
Time: ${line1}${line2 ? `, ${line2}` : ""}
Activity: ${activity}
Decided Dates: ${Array.isArray(selectedDates) && selectedDates.length > 0 ? selectedDates.join(", ") : "To be confirmed"}`;
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <>
      <Header />

      <main className="bg-background">
        <section className="container mx-auto px-4 py-14 md:py-20 lg:py-28">
          <Card className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-sm mt-6 mb-12 md:mt-8 md:mb-16">
            <CardContent className="p-7 sm:p-9">
              {/* header row */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-foreground/70" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent/10 text-accent px-2.5 py-1 text-xs font-medium">
                    Matched
                  </span>
                </div>
                {startDate && countdown && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {countdown === "Happening now" ? countdown : `${countdown} left`}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                You’re matched with {mentorName}
              </h1>

              {/* info panels: stack on small, 3-up on md+ */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Time */}
                <div className="rounded-lg border border-border bg-muted/30 p-4 sm:col-span-3 md:col-span-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Time of meetup
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-foreground">{line1}</div>
                  {line2 && <div className="text-sm text-muted-foreground">{line2}</div>}
                </div>

                {/* Activity */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Coffee className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Activity
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-foreground capitalize">
                    {activity}
                  </div>
                </div>

                {/* Dates/Days */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Decided Dates
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-foreground">
                    {Array.isArray(selectedDates) && selectedDates.length > 0 
                      ? selectedDates.join(", ")
                      : "To be confirmed"
                    }
                  </div>
                </div>
              </div>

              {/* actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {startDate && endDate && (
                  <Button
                    onClick={() =>
                      downloadICS({
                        title: `Meetup with ${mentorName}`,
                        description: `Activity: ${activity}\\nDecided Dates: ${Array.isArray(selectedDates) && selectedDates.length > 0 ? selectedDates.join(", ") : "To be confirmed"}`,
                        start: startDate,
                        end: endDate,
                        location: "",
                      })
                    }
                    className="shadow-none"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Add to calendar
                  </Button>
                )}

                <Button variant="outline" onClick={copyDetails} className="border-border">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy details
                </Button>

                {docHref && (
                  <a
                    href={docHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-muted/40"
                  >
                    {docLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default MatchupScreen;
