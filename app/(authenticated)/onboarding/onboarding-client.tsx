"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { checkAiHealth } from "@/lib/api/onboarding";
import ChatOnboarding from "@/components/onboarding/chat-onboarding";
import FormOnboarding from "@/components/onboarding/form-onboarding";

type OnboardingMode = "loading" | "chat" | "form";

export default function OnboardingClient() {
  const router = useRouter();
  const { business, updateBusiness } = useAuth();
  const [mode, setMode] = useState<OnboardingMode>("loading");

  // If already onboarded, redirect to dashboard
  useEffect(() => {
    if (business?.onboarding_status === "completed") {
      router.replace("/");
    }
  }, [business, router]);

  // Check AI health to determine onboarding path
  useEffect(() => {
    if (mode !== "loading") return;

    const checkHealth = async () => {
      try {
        const result = await checkAiHealth();
        setMode(result.ai_available ? "chat" : "form");
      } catch {
        setMode("form");
      }
    };

    void checkHealth();
  }, [mode]);

  const handleComplete = useCallback(() => {
    // Update business state so the route guard knows onboarding is done
    if (business) {
      updateBusiness({ ...business, onboarding_status: "completed" });
    }
    router.replace("/");
  }, [business, updateBusiness, router]);

  if (mode === "loading") {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        <p className="mt-3 text-sm text-zinc-500">Setting things up...</p>
      </div>
    );
  }

  if (mode === "chat") {
    return <ChatOnboarding onComplete={handleComplete} />;
  }

  return <FormOnboarding onComplete={handleComplete} />;
}
