"use client";

import { useState } from "react";
import { Home, Camera, GraduationCap, Wrench } from "lucide-react";

interface PersonaSelectorProps {
  onSelect: (persona: string, label?: string) => void;
}

const PERSONAS = [
  {
    id: "interior_designer",
    label: "Interior Designer",
    icon: Home,
  },
  {
    id: "photographer",
    label: "Photographer",
    icon: Camera,
  },
  {
    id: "coach",
    label: "Coach / Consultant",
    icon: GraduationCap,
  },
  {
    id: "other",
    label: "Other",
    icon: Wrench,
  },
];

export default function PersonaSelector({ onSelect }: PersonaSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [otherLabel, setOtherLabel] = useState("");

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "other") {
      if (otherLabel.trim()) {
        onSelect("other", otherLabel.trim());
      }
    } else {
      onSelect(selected);
    }
  };

  const canContinue =
    selected !== null && (selected !== "other" || otherLabel.trim().length > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-semibold">Aap kya karte hain?</h2>
      <p className="text-center text-sm text-zinc-500">
        This helps us set up your workspace
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PERSONAS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50 ${
              selected === id
                ? "border-primary bg-primary/5"
                : "border-zinc-200"
            }`}
          >
            <Icon
              className={`h-8 w-8 ${
                selected === id ? "text-primary" : "text-zinc-400"
              }`}
            />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {selected === "other" && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            value={otherLabel}
            onChange={(e) => setOtherLabel(e.target.value)}
            placeholder="e.g., Yoga Instructor, Contractor..."
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            autoFocus
          />
        </div>
      )}

      {selected && (
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          Continue
        </button>
      )}
    </div>
  );
}
