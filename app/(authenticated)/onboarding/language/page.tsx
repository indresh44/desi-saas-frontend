"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Globe, MessageSquare } from "lucide-react";
import {
  setLanguage as apiSetLanguage,
  completeOnboarding,
} from "@/lib/api/onboarding";
import { useAuth } from "@/lib/auth/auth-context";
import { OnboardingShell } from "../_components/OnboardingShell";
import { renderAccentHeading } from "../_components/LeftPanel";
import { RoleCard } from "../_components/RoleCard";
import { FinishSetupOverlay } from "../_components/FinishSetupOverlay";

type LangId = "english" | "hinglish";

const LANGS: {
  id: LangId;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "english",
    title: "English",
    description: "Stick to English only. Best for English-first conversations.",
    icon: <Globe strokeWidth={1.75} />,
  },
  {
    id: "hinglish",
    title: "Hinglish",
    description: "Mix Hindi and English freely — the way most of us actually talk.",
    icon: <MessageSquare strokeWidth={1.75} />,
  },
];

const SS_LANGUAGE = "onboarding.language";
const SS_PERSONA = "onboarding.persona";
const SS_STAGES = "onboarding.stages";
const SS_FINISHING = "onboarding.finishing";

export default function LanguagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const { business, user, updateBusiness } = useAuth();

  const [selected, setSelected] = useState<LangId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Finish-setup choreography. Animation runs in parallel with API. The CTA
  // at the end is what the user clicks to leave — gated on apiDone.
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [apiDone, setApiDone] = useState(false);

  // Restore previous selection from sessionStorage
  useEffect(() => {
    if (selected) return;
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(SS_LANGUAGE);
      if (cached === "english" || cached === "hinglish") {
        setSelected(cached);
      } else {
        setSelected("english");
      }
    }
  }, [selected]);

  // If user lands here without picking a persona, send them back to step 1
  useEffect(() => {
    if (preview) return;
    if (typeof window !== "undefined") {
      const persona = sessionStorage.getItem(SS_PERSONA);
      if (!persona) {
        router.replace("/onboarding/role");
      }
    }
  }, [preview, router]);

  const canFinish = useMemo(
    () => Boolean(selected) && !submitting,
    [selected, submitting]
  );

  const handleFinish = async () => {
    if (!selected) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SS_LANGUAGE, selected);
      // Tell the layout to ignore the "completed → /" redirect while we play
      // the animation; cleared when the user clicks the overlay's CTA.
      sessionStorage.setItem(SS_FINISHING, "1");
    }

    setError(null);
    setSubmitting(true);
    setOverlayOpen(true);

    if (preview) {
      setApiDone(true);
      return;
    }

    try {
      // Save language, then complete onboarding. Run in series so the user's
      // language preference is recorded before the account flips to "completed".
      await apiSetLanguage(selected);
      await completeOnboarding("form");
      setApiDone(true);
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Couldn't finish setup. Please try again.";
      // Hide the overlay so the user sees the inline error and can retry.
      setOverlayOpen(false);
      setSubmitting(false);
      setError(msg);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SS_FINISHING);
      }
    }
  };

  const handleContinue = () => {
    // CTA click — clear flags, sync auth context, navigate.
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SS_FINISHING);
      sessionStorage.removeItem(SS_PERSONA);
      sessionStorage.removeItem(SS_STAGES);
      sessionStorage.removeItem(SS_LANGUAGE);
    }
    if (preview) {
      router.replace("/onboarding/role?preview=1");
      return;
    }
    if (business) {
      updateBusiness({ ...business, onboarding_status: "completed" });
    }
    router.replace("/");
  };

  return (
    <OnboardingShell
      leftHeading={renderAccentHeading("How should we ", "talk?")}
      leftDescription="Pick how you'd like the AI to chat with you. You can change this anytime in Settings."
      stepLabel="STEP 03 / 03"
      stepNumber={3}
      totalSteps={3}
    >
      <h2
        className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl"
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        Your chat preference
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Choose the language you&apos;d like the AI to use
      </p>

      <div
        role="radiogroup"
        aria-label="Select your chat language"
        className="mt-8 flex flex-col gap-3"
      >
        {LANGS.map((lang, index) => (
          <RoleCard
            key={lang.id}
            index={index}
            id={lang.id}
            title={lang.title}
            description={lang.description}
            icon={lang.icon}
            selected={selected === lang.id}
            onSelect={(id) => setSelected(id as LangId)}
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
          onClick={() => void handleFinish()}
          disabled={!canFinish}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[220px]"
          style={{
            background: "var(--brand-blue)",
            boxShadow: "0 6px 20px var(--brand-blue-glow)",
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finishing...
            </>
          ) : (
            <>
              Finish Setup <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-400">You can change this later</p>
      </div>

      {overlayOpen ? (
        <FinishSetupOverlay
          userName={user?.name ?? business?.name ?? null}
          apiReady={apiDone}
          onContinue={handleContinue}
        />
      ) : null}
    </OnboardingShell>
  );
}
