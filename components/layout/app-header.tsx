"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants/app";
import { useAuth } from "@/lib/auth/auth-context";

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, business, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm font-medium text-zinc-900">
              {business?.name ?? APP_NAME}
            </p>
            <p className="hidden text-xs text-zinc-500 md:block">
              {APP_NAME} workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
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