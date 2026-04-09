"use client";

import { ArrowRight } from "lucide-react";

interface PipelinePreviewProps {
  stages: { name: string; color: string }[];
  onContinue: () => void;
}

export default function PipelinePreview({
  stages,
  onContinue,
}: PipelinePreviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-semibold">
        Your enquiry pipeline
      </h2>
      <p className="text-center text-sm text-zinc-500">
        Aap baad mein isko customize bhi kar sakte hain
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 py-4">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: stage.color }}
            >
              {stage.name}
            </span>
            {index < stages.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue
      </button>
    </div>
  );
}
