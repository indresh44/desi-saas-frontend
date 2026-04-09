"use client";

import { useState } from "react";
import PersonaSelector from "./persona-selector";
import PipelinePreview from "./pipeline-preview";
import SetupAnimation from "./setup-animation";
import {
  setPersona as apiSetPersona,
  addCatalogItem,
  completeOnboarding,
} from "@/lib/api/onboarding";

const ITEM_EXAMPLES: Record<string, { name: string; price: string }> = {
  interior_designer: { name: "Modular Kitchen", price: "250000" },
  photographer: { name: "Wedding Package", price: "35000" },
  coach: { name: "Monthly Package", price: "5000" },
  other: { name: "Service Package", price: "10000" },
};

interface FormOnboardingProps {
  onComplete: () => void;
}

type Step = "persona" | "pipeline" | "catalog" | "setup";

export default function FormOnboarding({ onComplete }: FormOnboardingProps) {
  const [step, setStep] = useState<Step>("persona");
  const [persona, setPersona] = useState("");
  const [pipelineStages, setPipelineStages] = useState<
    { name: string; color: string }[]
  >([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePersonaSelect = async (
    selectedPersona: string,
    label?: string
  ) => {
    setIsSubmitting(true);
    try {
      const result = await apiSetPersona(selectedPersona, label);
      setPersona(selectedPersona);
      setPipelineStages(result.pipeline_stages);

      const example = ITEM_EXAMPLES[selectedPersona] || ITEM_EXAMPLES.other;
      setItemName(example.name);
      setItemPrice(example.price);

      setStep("pipeline");
    } catch {
      // If persona set fails, stay on persona step
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePipelineContinue = () => {
    setStep("catalog");
  };

  const handleCatalogSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (itemName.trim() && itemPrice) {
        await addCatalogItem(itemName.trim(), parseFloat(itemPrice));
      }
      await completeOnboarding("form");
      setStep("setup");
    } catch {
      // Allow skipping on error
      await completeOnboarding("form").catch(() => {});
      setStep("setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipCatalog = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding("form");
      setStep("setup");
    } catch {
      setStep("setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "setup") {
    return <SetupAnimation onComplete={onComplete} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">SellnSettle</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {step === "persona" && "Let\u2019s set up your workspace"}
            {step === "pipeline" && "Your pipeline is ready"}
            {step === "catalog" && "One last thing"}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          {step === "persona" && (
            <div className={isSubmitting ? "pointer-events-none opacity-60" : ""}>
              <PersonaSelector onSelect={handlePersonaSelect} />
            </div>
          )}

          {step === "pipeline" && (
            <PipelinePreview
              stages={pipelineStages}
              onContinue={handlePipelineContinue}
            />
          )}

          {step === "catalog" && (
            <div className="space-y-4">
              <h2 className="text-center text-lg font-semibold">
                Add your first item
              </h2>
              <p className="text-center text-sm text-zinc-500">
                AI ko aapke business ki samajh aayegi
              </p>

              <div>
                <label className="text-sm font-medium">Item / Service name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                  placeholder={ITEM_EXAMPLES[persona]?.name || "Service name"}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price (₹)</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                  placeholder={ITEM_EXAMPLES[persona]?.price || "10000"}
                />
              </div>

              <button
                onClick={handleCatalogSubmit}
                disabled={isSubmitting}
                className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "Setting up..." : "Add & finish setup"}
              </button>

              <button
                onClick={handleSkipCatalog}
                disabled={isSubmitting}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
