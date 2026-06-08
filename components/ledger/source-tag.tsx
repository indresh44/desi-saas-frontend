import { cn } from "@/lib/utils";

/**
 * Source tag — §7.8. Inline-flex, gap 5px, 12.5px / 500, muted text,
 * tiny 6px square dot. Missing source renders at 50% opacity with
 * "No source" copy.
 */
export function SourceTag({
  source,
  className,
}: {
  source?: string | null;
  className?: string;
}) {
  const isEmpty = !source;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] text-[12.5px] font-medium leading-none",
        isEmpty && "opacity-50",
        className,
      )}
      style={{ color: "var(--color-text-muted)" }}
    >
      <span
        aria-hidden
        className="inline-block size-[6px] rounded-[2px]"
        style={{ background: "var(--color-text-faint)" }}
      />
      {source ?? "No source"}
    </span>
  );
}
