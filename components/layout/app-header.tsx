"use client";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants/app";
import { useAuth } from "@/lib/auth/auth-context";

export function AppHeader() {
  const { user, business, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div>
          <p className="text-sm font-medium text-zinc-900">{APP_NAME}</p>
          <p className="text-xs text-zinc-500">
            {business?.name ? `${business.name} workspace` : "CRM workspace"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-zinc-700">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-zinc-500">{user?.email ?? ""}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => void logout()}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}