"use client";

import { useState } from "react";
import { Moon, Sparkles, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants/app";
import { useAuth } from "@/lib/auth/auth-context";
import { useChat } from "@/lib/chat/chat-context";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

export function AppHeader() {
  const { user, business, logout } = useAuth();
  const { isOpen: isChatOpen, toggleChat } = useChat();
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
          <div>
            <p className="text-md font-medium text-primary">
              {business?.name ?? APP_NAME}
            </p>
            <p className="hidden text-xs text-muted-foreground md:block">
              {APP_NAME} workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Chat / AI assistant trigger. Distinctive primary-tinted styling
              + Sparkles glyph so it reads as "ask the AI", not "another menu".
              Visible on every breakpoint; on desktop the floating button in
              the bottom-right is the secondary entry point. The label is
              hidden on small screens to save space — the icon carries the
              meaning, with `aria-label` for accessibility. */}
          <button
            type="button"
            onClick={toggleChat}
            aria-label={isChatOpen ? "Close AI assistant" : "Open AI assistant"}
            aria-pressed={isChatOpen}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15 active:translate-y-px md:min-h-9 md:px-3"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

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
