"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

// Redirects users who are already past onboarding. The auth-context also
// redirects the other way (auth users without onboarding to /onboarding/*),
// so new users land here and completed users bounce to /.
//
// Dev escape hatch: visit any onboarding page with `?preview=1` to view
// the screens without triggering this redirect, from any logged-in account.
// The role and pipeline pages also skip their backend writes when preview=1.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { business } = useAuth();

  useEffect(() => {
    if (searchParams.get("preview") === "1") return;
    // While the final-step page is showing the Finish Setup animation, it sets
    // this flag so we don't bounce the user out the moment their onboarding
    // status flips to "completed" — the user needs to see the celebration and
    // click the CTA themselves.
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("onboarding.finishing") === "1"
    ) {
      return;
    }
    if (business?.onboarding_status === "completed") {
      router.replace("/");
    }
  }, [business, router, searchParams]);

  return <>{children}</>;
}
