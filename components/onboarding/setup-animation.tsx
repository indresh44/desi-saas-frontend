"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface SetupAnimationProps {
  onComplete: () => void;
}

const STEPS = [
  "Setting up your workspace...",
  "Configuring your enquiry pipeline...",
  "Training AI for your business...",
  "Almost ready...",
];

export default function SetupAnimation({ onComplete }: SetupAnimationProps) {
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setCompletedSteps(index + 1);
        }, (index + 1) * 800)
      );
    });

    timers.push(
      setTimeout(() => {
        setShowDone(true);
      }, STEPS.length * 800 + 400)
    );

    timers.push(
      setTimeout(() => {
        onComplete();
      }, STEPS.length * 800 + 2000)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm space-y-4">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`flex items-center gap-3 transition-all duration-500 ${
              index < completedSteps
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                index < completedSteps
                  ? "bg-emerald-500 text-white scale-100"
                  : "bg-zinc-200 scale-75"
              }`}
            >
              {index < completedSteps && <Check className="h-3.5 w-3.5" />}
            </div>
            <span
              className={`text-sm transition-colors duration-300 ${
                index < completedSteps ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}

        {showDone && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 text-center duration-500">
            <p className="text-lg font-semibold text-zinc-900">
              Sab set hai! Let&apos;s get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
