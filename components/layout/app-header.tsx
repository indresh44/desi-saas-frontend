"use client";

import { useState } from "react";
import { Menu, Moon, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants/app";
import { useAuth } from "@/lib/auth/auth-context";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

type AppHeaderProps = {
  onMenuClick?: () => void;
};

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, business, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-shell-border bg-shell-header-bg backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-shell-sidebar-text hover:bg-shell-sidebar-hover md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-md font-medium text-primary">
              {business?.name ?? APP_NAME}
            </p>
            <p className="hidden text-xs text-muted-foreground md:block">
              {APP_NAME} workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunMedium /> : <Moon />}
          </Button>
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-primary">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => void logout()}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
