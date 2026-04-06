"use client";

import { useAuth } from "@/lib/auth/auth-context";
import DashboardClient from "@/components/dashboard/dashboard-client";
import LandingPageClient from "@/components/landing/landing-page-client";

export function HomeRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPageClient />;
  }

  return <DashboardClient />;
}