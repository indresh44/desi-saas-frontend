// One-stop presentation map for the next-action cascade. Card accents,
// section headers, and the rail summary all read from this — so a colour
// or icon change happens in exactly one place.
//
// Tailwind classes are listed by purpose (accent bar, dot, badge tint,
// header tint) rather than packed into a single blob — keeps `cn(...)`
// composition at the call site honest.

import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Moon,
} from "lucide-react";
import type { NextActionType } from "@/lib/types/next-action";

export interface NextActionPresentation {
  // Section header in the action list (e.g. "Overdue follow-ups").
  groupLabel: string;
  // Tailwind class for the 3px left accent bar on the action card.
  accentBar: string;
  // Tailwind class for the small coloured dot in the rail summary.
  accentDot: string;
  // Tailwind class for the coloured text in the "Follow-up 5 days late" line.
  accentText: string;
  // Tailwind class for the bar fill in the rail summary's proportional bar.
  accentBarFill: string;
  // lucide-react icon used next to the "next step" line on the card.
  Icon: LucideIcon;
}

const PRESENTATION: Record<NextActionType, NextActionPresentation> = {
  followup_overdue: {
    groupLabel: "Overdue follow-ups",
    accentBar: "before:bg-rose-500",
    accentDot: "bg-rose-500",
    accentText: "text-rose-600",
    accentBarFill: "bg-rose-500",
    Icon: AlarmClock,
  },
  followup_due_today: {
    groupLabel: "Due today",
    accentBar: "before:bg-sky-500",
    accentDot: "bg-sky-500",
    accentText: "text-sky-600",
    accentBarFill: "bg-sky-500",
    Icon: Clock,
  },
  no_followup_set: {
    groupLabel: "No follow-up set",
    accentBar: "before:bg-amber-500",
    accentDot: "bg-amber-500",
    accentText: "text-amber-700",
    accentBarFill: "bg-amber-500",
    Icon: CalendarPlus,
  },
  gone_quiet: {
    groupLabel: "Gone quiet",
    accentBar: "before:bg-slate-500",
    accentDot: "bg-slate-500",
    accentText: "text-slate-600",
    accentBarFill: "bg-slate-500",
    Icon: Moon,
  },
  followup_upcoming: {
    // Surfaced on the enquiry list (not the dashboard's needs-action
    // list). Neutral grey stripe distinguishes "calm" enquiries from
    // urgent ones without screaming for attention.
    groupLabel: "Upcoming follow-ups",
    accentBar: "before:bg-slate-200",
    accentDot: "bg-slate-300",
    accentText: "text-muted-foreground",
    accentBarFill: "bg-slate-300",
    Icon: CalendarClock,
  },
  none: {
    // Won / Lost / Closed. Same neutral grey as upcoming — the list
    // shows the full record, and these still need a stripe so the row
    // doesn't visually merge with its neighbour.
    groupLabel: "Closed",
    accentBar: "before:bg-slate-200",
    accentDot: "bg-slate-300",
    accentText: "text-muted-foreground",
    accentBarFill: "bg-slate-300",
    Icon: CheckCircle2,
  },
};

export function presentationFor(type: NextActionType): NextActionPresentation {
  return PRESENTATION[type] ?? PRESENTATION.none;
}
