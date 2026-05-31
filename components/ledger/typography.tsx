import { cn } from "@/lib/utils";

/**
 * Mono — wraps numerals, dates, money, IDs in Spline Sans Mono.
 * Use everywhere the spec calls for "mono". Renders inline by default.
 */
export function Mono({
  as: Tag = "span",
  className,
  children,
  ...props
}: {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const Component = Tag as React.ElementType;
  return (
    <Component className={cn("ledger-mono", className)} {...props}>
      {children}
    </Component>
  );
}

/**
 * Eyebrow — UPPERCASE mono label used above grouped lists,
 * panel headers and AI cards. Spec §4 / §13.3.
 */
export function Eyebrow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("ledger-eyebrow", className)} {...props}>
      {children}
    </span>
  );
}

/**
 * PageTitle — 26px / 750 / -0.025em. Spec §4 type scale.
 * Renders an <h1> by default; override with `as` for landmark pages.
 */
export function PageTitle({
  as: Tag = "h1",
  className,
  children,
  ...props
}: {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      className={cn("text-[26px] font-bold tracking-[-0.025em]", className)}
      style={{ color: "var(--color-text)" }}
      {...props}
    >
      {children}
    </Component>
  );
}
