import type { Metadata } from "next";
import LandingPageClientOld from "@/components/landing/landing-page-client-old";

// ── Temporary snapshot of the previous landing page ──
// Kept reachable at /landing_page_old for reference while the main
// landing page (/) is rewritten. Intentionally NOT in the sitemap and
// noindexed so it never affects search/online presence.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "https://sellnsettle.com" },
};

// Renders the old landing visuals directly — no auth gate, no dashboard
// redirect — so it can always be previewed regardless of login state.
export default function LandingPageOld() {
  return <LandingPageClientOld />;
}
