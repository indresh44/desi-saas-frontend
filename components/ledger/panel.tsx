import { cn } from "@/lib/utils";

/**
 * Panel — §14.3. The generic card surface used across Lead-detail,
 * Dashboard and Settings. 1px border, 8px radius, 20×22 padding.
 *
 * Composed with PanelHead for the title + optional trailing slot
 * (a count, button, or icon).
 */
export function Panel({
  className,
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(className)}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
        padding: "20px 22px",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  count,
  trailing,
  className,
}: {
  title: React.ReactNode;
  /** Mono faint count rendered next to the title. */
  count?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="flex items-baseline gap-2">
        <h3
          className="text-[15px] font-bold tracking-[-0.01em]"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h3>
        {count != null && (
          <small
            className="text-[12px] font-medium"
            style={{
              fontFamily: "var(--ledger-font-mono)",
              color: "var(--color-text-faint)",
            }}
          >
            {count}
          </small>
        )}
      </div>
      {trailing}
    </div>
  );
}
