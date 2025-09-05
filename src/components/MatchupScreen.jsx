import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Coffee,
  Clock,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ----------------------- helpers ----------------------- */
const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDisplay = (date) => {
  try {
    const d = new Date(date);
    const day = ordinal(d.getDate());
    const weekday = d.toLocaleString(undefined, { weekday: "long" });
    const month = d.toLocaleString(undefined, { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { line1: `${time}`, line2: `${weekday} ${day} ${month}, ${year}` };
  } catch {
    return { line1: "", line2: "" };
  }
};

// Parses “3pm, Tuesday 12th Sep, 2025” and similar.
// If parsing fails, returns null (countdown + ICS are hidden).
const parseMeetupTime = (meetupTime) => {
  // Try native first
  const direct = new Date(meetupTime);
  if (!isNaN(direct.getTime())) return direct;

  const cleaned = meetupTime
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .replace(/,/g, "")
    .trim();

  // e.g. "3pm Tuesday 12 Sep 2025" or "3:15 pm Tue 12 Sep 2025"
  const re =
    /(?:(\d{1,2})(?::(\d{2}))?\s*(am|pm))?\s*(?:mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)?\s*(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})/i;
  const m = cleaned.match(re);
  if (!m) return null;

  const [, hh = "9", mm = "00", ampm = "am", day, mon, year] = m;
  const monthMap = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  let H = parseInt(hh, 10) % 12;
  if (ampm && ampm.toLowerCase() === "pm") H += 12;

  const d = new Date();
  d.setFullYear(parseInt(year, 10));
  d.setMonth(monthMap[mon.toLowerCase()]);
  d.setDate(parseInt(day, 10));
  d.setHours(H, parseInt(mm || "0", 10), 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

const pad = (n) => String(n).padStart(2, "0");
const toICSDate = (d) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours()
  )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

const downloadICS = ({ title, description, start, end, location }) => {
  const dtStamp = toICSDate(new Date());
  const dtStart = toICSDate(start);
  const dtEnd = toICSDate(end);
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RIZZource//Match//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@rizzource`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : "",
    description ? `DESCRIPTION:${description.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meetup.ics";
  a.click();
  URL.revokeObjectURL(url);
};

/* -------------------- component -------------------- */
const MatchupScreen = ({
  mentorName = "Sher Khan",
  meetupTime = "3pm, Tuesday 12th Sep, 2025", // human-friendly string
  activity = "coffee",
  location, // optional e.g. "Campus Café"
  durationMinutes = 60,
  docHref = "#",
  docLabel = "General document (expectations of mentors and mentees)",
}) => {
  const startDate = useMemo(() => parseMeetupTime(meetupTime), [meetupTime]);
  const endDate = useMemo(() => {
    if (!startDate) return null;
    return new Date(startDate.getTime() + durationMinutes * 60000);
  }, [startDate, durationMinutes]);

  const { line1, line2 } = startDate
    ? formatDisplay(startDate)
    : { line1: meetupTime, line2: "" };

  // countdown
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!startDate) return;
    const tick = () => {
      const now = Date.now();
      const t = startDate.getTime() - now;
      if (t <= 0) return setCountdown("Happening now");
      const d = Math.floor(t / (1000 * 60 * 60 * 24));
      const h = Math.floor((t / (1000 * 60 * 60)) % 24);
      const m = Math.floor((t / (1000 * 60)) % 60);
      setCountdown(`${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m" : ""}`);
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [startDate]);

  const copyDetails = async () => {
    const text = `You’re matched with ${mentorName}
Time: ${line1}${line2 ? `, ${line2}` : ""}
Activity: ${activity}${location ? `\nLocation: ${location}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <>
      <Header />

      <div className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden px-4 py-10">
        {/* soft gradient + grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(209,213,219,0.45),transparent)]" />
        <div className="pointer-events-none absolute inset-0 [background:linear-gradient(to_right,transparent_0,transparent_24px,rgba(0,0,0,0.04)_25px),linear-gradient(to_bottom,transparent_0,transparent_24px,rgba(0,0,0,0.04)_25px)] bg-[length:26px_26px]" />

        <div className="relative">
          {/* gradient glow frame */}
          <div className="p-[2px] rounded-2xl bg-gradient-to-br from-amber-300/50 via-rose-300/50 to-emerald-300/50">
            <Card className="w-full max-w-2xl rounded-2xl backdrop-blur bg-white/70 border-white/60 shadow-xl">
              <CardContent className="p-8 sm:p-10">
                {/* header row */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-medium">
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

                {/* title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
                    You’re matched with {mentorName}
                  </span>
                </h1>

                {/* info panels */}
                <div className="mt-6 grid sm:grid-cols-3 gap-4">
                  <div className="col-span-2 rounded-xl border border-zinc-200/70 bg-white/60 p-5">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase tracking-wide">
                        Time of meetup
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-semibold text-zinc-900">{line1}</div>
                    {line2 && <div className="text-sm text-zinc-600">{line2}</div>}
                  </div>

                  <div className="rounded-xl border border-zinc-200/70 bg-white/60 p-5">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Coffee className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase tracking-wide">
                        Activity
                      </span>
                    </div>
                    <div className="mt-2 text-xl font-semibold text-zinc-900 capitalize">
                      {activity}
                    </div>
                    {location && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600">
                        <MapPin className="h-4 w-4" />
                        <span>{location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {startDate && endDate && (
                    <Button
                      onClick={() =>
                        downloadICS({
                          title: `Meetup with ${mentorName}`,
                          description: `Activity: ${activity}${
                            location ? ` \\nLocation: ${location}` : ""
                          }`,
                          start: startDate,
                          end: endDate,
                          location,
                        })
                      }
                      className="shadow-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Add to calendar
                    </Button>
                  )}

                  <Button variant="outline" onClick={copyDetails} className="border-zinc-300">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy details
                  </Button>

                  {docHref && (
                    <a
                      href={docHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
                    >
                      {docLabel}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* subtle spotlight hover */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(300px_200px_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.7),transparent)]" />
        </div>

        {/* ambient blobs */}
        <div className="pointer-events-none absolute left-1/4 top-[15%] h-32 w-32 rounded-full blur-2xl bg-amber-200/40" />
        <div className="pointer-events-none absolute right-1/4 bottom-[12%] h-40 w-40 rounded-full blur-3xl bg-emerald-200/40" />
      </div>

      <Footer />
    </>
  );
};

export default MatchupScreen;
