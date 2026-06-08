import { cn } from "@/lib/utils";

/**
 * No-op wrapper kept for backwards compatibility. The Ledger
 * design system is applied globally at `:root` (see app/ledger.css)
 * so no scoping wrapper is needed. Renders a plain `<div>` (or the
 * provided tag) with the className passed through.
 *
 * Prefer composing directly with Ledger primitives rather than
 * wrapping in `<LedgerSurface>`.
 */
export function LedgerSurface({
  as: Tag = "div",
  className,
  children,
}: {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}) {
  const Component = Tag as React.ElementType;
  return <Component className={cn(className)}>{children}</Component>;
}
