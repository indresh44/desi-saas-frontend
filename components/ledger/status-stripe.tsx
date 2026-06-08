import { FOLLOWUPS, type FollowupKind } from "./tokens";

/**
 * Status edge stripe — §7.13. 4px coloured left edge that signals
 * triage state at a glance. Only overdue / unset / today render a
 * stripe — every other state stays transparent so the list stays calm.
 *
 * Use this on:
 *   - mobile enquiry cards (§7.10) as a `::before`-style overlay
 *   - the first column of the desktop ledger table (§7.9)
 *   - dashboard triage cards (§13.3) — dashboard extends the map
 *     with `quiet → --color-text-faint`; pass `extended` for that.
 */
export function StatusStripe({
  kind,
  extended = false,
  className,
  width = 4,
}: {
  kind: FollowupKind;
  /** Dashboard variant — adds a calm stripe for "quiet" leads. */
  extended?: boolean;
  className?: string;
  /** Stripe width in px (4 by default per spec, 3 inside dense lists). */
  width?: number;
}) {
  const spec = FOLLOWUPS[kind];
  const visible = spec.stripe || (extended && kind === "quiet");
  if (!visible) return null;

  return (
    <span
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width,
        background: spec.color,
      }}
    />
  );
}
