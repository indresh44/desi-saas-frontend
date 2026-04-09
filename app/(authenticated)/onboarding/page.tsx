import type { Metadata } from "next";
import OnboardingClient from "./onboarding-client";

export const metadata: Metadata = {
  title: "Setup | SellnSettle",
  description: "Set up your SellnSettle workspace",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
