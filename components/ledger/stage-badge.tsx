import { cn } from "@/lib/utils";
import { STAGES, type StageId } from "./tokens";

/**
 * Stage badge — §7.6.
 *
 * Two modes:
 *   - **Enum stage** — pass `stage="visit"`; uses tokenised fg/bg pair.
 *   - **Custom stage** — pass `name="Quote Sent"` + optional `color="#0ea5a0"`;
 *     uses the server-provided colour to tint fg/bg/border. Falls back
 *     to a neutral chip when no colour is supplied.
 *
 * Custom mode exists because the app supports user-defined pipeline
 * stages (configurable in onboarding); the enum is for hand-coded
 * usage and Ledger-spec examples.
 *
 * Layout: inline-flex, 22px tall, 7px radius, 11.5px / 650, optional
 * 6px leading dot at 0.9 opacity.
 */
type StageBadgeProps =
  | {
      stage: StageId;
      withDot?: boolean;
      className?: string;
      name?: never;
      color?: never;
    }
  | {
      stage?: never;
      name: string;
      /** Server-provided stage colour (e.g. "#0ea5a0"). */
      color?: string | null;
      withDot?: boolean;
      className?: string;
    };

export function StageBadge(props: StageBadgeProps) {
  const { withDot = true, className } = props;
  const { label, fg, bg } = resolveStage(props);

  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 px-[9px] text-[11.5px] font-semibold tracking-[-0.01em]",
        className,
      )}
      style={{
        color: fg,
        background: bg,
        borderRadius: "var(--ledger-radius-badge)",
      }}
    >
      {withDot && (
        <span
          aria-hidden
          className="inline-block size-[6px] rounded-full opacity-90"
          style={{ background: "currentColor" }}
        />
      )}
      {label}
    </span>
  );
}

function resolveStage(props: StageBadgeProps): {
  label: string;
  fg: string;
  bg: string;
} {
  if ("stage" in props && props.stage) {
    const spec = STAGES[props.stage];
    return { label: spec.label, fg: spec.fg, bg: spec.bg };
  }
  const name = (props as { name: string }).name;
  const color = (props as { color?: string | null }).color;
  if (color) {
    // Use the server colour at low opacity for the tint so the chip
    // stays legible against any surface, mirroring the Ledger fg/bg
    // pair pattern from §3.2.
    return {
      label: name,
      fg: color,
      bg: `color-mix(in oklch, ${color} 14%, transparent)`,
    };
  }
  // Neutral fallback for stages without a colour.
  return {
    label: name,
    fg: "var(--color-text-secondary)",
    bg: "var(--color-surface-raised)",
  };
}
