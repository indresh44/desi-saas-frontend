import {
  AlarmClock,
  Calendar,
  CalendarX,
  Check,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FOLLOWUPS, type FollowupKind } from "./tokens";

const ICONS = {
  alarm: AlarmClock,
  calendar: Calendar,
  clock: Clock,
  check: Check,
  nudge: MoreHorizontal,
  x: CalendarX,
} as const;

/**
 * Follow-up pill — §7.7. The screen's primary signal. Inline-flex,
 * 13px / 600, 14px leading icon, colour driven by state.
 *
 * State → label/colour mapping lives in tokens.FOLLOWUPS so the
 * visual side stays in lockstep with status logic.
 */
export function FollowupPill({
  kind,
  label,
  className,
}: {
  kind: FollowupKind;
  /** Override the default copy (e.g. "2 days late", "Follow up 30 May"). */
  label?: string;
  className?: string;
}) {
  const spec = FOLLOWUPS[kind];
  const Icon = ICONS[spec.icon];

  // Spec §7.7: "none" sits at 55% opacity.
  const isNone = kind === "none";
  // Scheduled / quiet / closed render at weight 550 per §7.7.
  const isQuiet = kind === "scheduled" || kind === "quiet" || kind === "closed";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] text-[13px] leading-none",
        isQuiet ? "font-medium" : "font-semibold",
        isNone && "opacity-55",
        className,
      )}
      style={{ color: spec.color }}
    >
      <Icon className="size-[14px]" strokeWidth={1.8} aria-hidden />
      {label ?? spec.defaultLabel}
    </span>
  );
}
