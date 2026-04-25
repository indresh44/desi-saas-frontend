"use client";

// Read-only row rendering a single pipeline stage. Shows the stage's color
// dot and name. V1 is read-only confirmation; drag/reorder deferred.

type Props = {
  index: number;
  name: string;
  color: string;
};

export function PipelineRow({ index, name, color }: Props) {
  return (
    <div
      className="role-card-enter flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
      style={{ "--i": index } as React.CSSProperties}
    >
      {/* stage-number bubble */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{
          background: "var(--brand-blue-tint)",
          color: "var(--brand-blue-deep)",
        }}
        aria-hidden="true"
      >
        {index + 1}
      </div>

      {/* color dot from backend template */}
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />

      <div className="flex-1 text-sm font-medium text-gray-900">{name}</div>
    </div>
  );
}
