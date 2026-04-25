"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPipelinePreview } from "@/lib/api/onboarding";
import { useAuth } from "@/lib/auth/auth-context";
import { OnboardingShell } from "../_components/OnboardingShell";
import { renderAccentHeading } from "../_components/LeftPanel";
import { PipelineRow } from "../_components/PipelineRow";

type Stage = { name: string; color: string };

const SS_PERSONA = "onboarding.persona";
const SS_STAGES = "onboarding.stages";

// Fallback stages used only in preview mode when no persona is cached.
const PREVIEW_FALLBACK_STAGES: Stage[] = [
  { name: "New Enquiry", color: "#3b82f6" },
  { name: "Interested", color: "#f59e0b" },
  { name: "Site Visit Scheduled", color: "#a855f7" },
  { name: "WIP", color: "#10b981" },
  { name: "Completed", color: "#06b6d4" },
];

export default function PipelinePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const { business } = useAuth();

  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const cachedStages = readCachedStages();
      if (cachedStages) {
        if (!cancelled) {
          setStages(cachedStages);
          setLoading(false);
        }
        return;
      }

      const persona = readCachedPersona() ?? business?.business_type ?? null;
      if (!persona) {
        if (preview) {
          if (!cancelled) {
            setStages(PREVIEW_FALLBACK_STAGES);
            setLoading(false);
          }
          return;
        }
        router.replace("/onboarding/role");
        return;
      }

      try {
        const res = await getPipelinePreview(persona);
        if (!cancelled) {
          setStages(res.stages);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(SS_STAGES, JSON.stringify(res.stages));
          }
        }
      } catch {
        if (!cancelled) {
          if (preview) {
            setStages(PREVIEW_FALLBACK_STAGES);
          } else {
            setError("Couldn't load your pipeline. Please refresh or go back.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [business?.business_type, preview, router]);

  const handleContinue = () => {
    router.push(preview ? "/onboarding/language?preview=1" : "/onboarding/language");
  };

  return (
    <OnboardingShell
      leftHeading={renderAccentHeading("Your ", "enquiry pipeline.")}
      leftDescription="Every lead moves through these stages. You can rearrange or rename them any time from Settings."
      stepLabel="STEP 02 / 03"
      stepNumber={2}
      totalSteps={3}
    >
      <h2
        className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl"
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        Your enquiry pipeline
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        These are the default stages for your workflow — customize anytime
      </p>

      <div className="mt-8 flex flex-col gap-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading your pipeline...
          </div>
        ) : (
          stages.map((s, index) => (
            <PipelineRow
              key={`${index}-${s.name}`}
              index={index}
              name={s.name}
              color={s.color}
            />
          ))
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[220px]"
          style={{
            background: "var(--brand-blue)",
            boxShadow: "0 6px 20px var(--brand-blue-glow)",
          }}
        >
          Continue <span aria-hidden="true">→</span>
        </button>
        <p className="text-xs text-gray-400">
          Stages can be edited anytime in Settings
        </p>
      </div>
    </OnboardingShell>
  );
}

function readCachedPersona(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SS_PERSONA);
}

function readCachedStages(): Stage[] | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SS_STAGES);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((s) => typeof s?.name === "string" && typeof s?.color === "string")
    ) {
      return parsed as Stage[];
    }
  } catch {
    // fall through
  }
  return null;
}
