"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setPersona as apiSetPersona } from "@/lib/api/onboarding";
import { useAuth } from "@/lib/auth/auth-context";
import { OnboardingShell } from "../_components/OnboardingShell";
import { renderAccentHeading } from "../_components/LeftPanel";
import { RoleCard } from "../_components/RoleCard";
import { DesignerIcon } from "../_components/icons/DesignerIcon";
import { PhotographerIcon } from "../_components/icons/PhotographerIcon";
import { CoachIcon } from "../_components/icons/CoachIcon";
import { OtherIcon } from "../_components/icons/OtherIcon";

type RoleId = "interior_designer" | "photographer" | "coach" | "other";

const ROLES: { id: RoleId; title: string; description: string; icon: React.ReactNode; label: string }[] = [
  {
    id: "interior_designer",
    title: "Interior Designer",
    description: "Projects, site visits, quotes",
    icon: <DesignerIcon />,
    label: "Interior Designer",
  },
  {
    id: "photographer",
    title: "Photographer",
    description: "Shoots, deliverables, advances",
    icon: <PhotographerIcon />,
    label: "Photographer",
  },
  {
    id: "coach",
    title: "Coach / Consultant",
    description: "Sessions, packages, programs",
    icon: <CoachIcon />,
    label: "Coach / Consultant",
  },
  {
    id: "other",
    title: "Something Else",
    description: "Custom workflow — we'll adapt",
    icon: <OtherIcon />,
    label: "Something Else",
  },
];

// sessionStorage keys shared between role and pipeline pages
const SS_PERSONA = "onboarding.persona";
const SS_STAGES = "onboarding.stages";

export default function RolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const { business, updateBusiness } = useAuth();

  const [selected, setSelected] = useState<RoleId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore previous selection: auth context first (source of truth on refresh),
  // then sessionStorage as a secondary cache in case backend hasn't rehydrated.
  useEffect(() => {
    if (selected) return;
    if (business?.business_type && isRoleId(business.business_type)) {
      setSelected(business.business_type);
      return;
    }
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(SS_PERSONA);
      if (cached && isRoleId(cached)) {
        setSelected(cached);
      }
    }
  }, [business?.business_type, selected]);

  const canContinue = useMemo(
    () => Boolean(selected) && !submitting,
    [selected, submitting]
  );

  const handleContinue = async () => {
    if (!selected) return;
    // Preview mode: skip backend write, just move to next screen.
    if (preview) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SS_PERSONA, selected);
      }
      router.push("/onboarding/pipeline?preview=1");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const chosen = ROLES.find((r) => r.id === selected);
      const result = await apiSetPersona(selected, chosen?.label);
      // Cache for the pipeline page
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SS_PERSONA, selected);
        sessionStorage.setItem(SS_STAGES, JSON.stringify(result.pipeline_stages));
      }
      // Keep auth context in sync so back-navigation restores selection
      if (business) {
        updateBusiness({
          ...business,
          business_type: result.business_type,
          onboarding_status: result.onboarding_status,
        });
      }
      router.push("/onboarding/pipeline");
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't save your selection. Please try again.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <OnboardingShell
      leftHeading={renderAccentHeading("Let's set up your ", "workspace.")}
      leftDescription="Tell us what best describes you so we can personalize your experience."
      stepLabel="STEP 01 / 03"
      stepNumber={1}
      totalSteps={3}
    >
      <h2
        className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl"
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        What describes you best?
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Choose one — you can change this later
      </p>

      <div
        role="radiogroup"
        aria-label="Select your role"
        className="mt-8 flex flex-col gap-3"
      >
        {ROLES.map((role, index) => (
          <RoleCard
            key={role.id}
            index={index}
            id={role.id}
            title={role.title}
            description={role.description}
            icon={role.icon}
            selected={selected === role.id}
            onSelect={(id) => setSelected(id as RoleId)}
          />
        ))}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={!canContinue}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[220px]"
          style={{
            background: "var(--brand-blue)",
            boxShadow: "0 6px 20px var(--brand-blue-glow)",
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Continue <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-400">You can change this later</p>
      </div>
    </OnboardingShell>
  );
}

function isRoleId(value: string): value is RoleId {
  return (
    value === "interior_designer" ||
    value === "photographer" ||
    value === "coach" ||
    value === "other"
  );
}
