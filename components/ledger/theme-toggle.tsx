"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getCurrentTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Moon-button theme toggle as specified in §7.14 / §11.4 of the
 * Ledger spec. Flips between light and dark and persists the
 * choice to localStorage. Mounts as an icon button styled for the
 * top bar.
 */
export function LedgerThemeToggle({ className }: { className?: string }) {
  // Avoid hydration mismatch — read the real theme only after mount.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getCurrentTheme());
    setMounted(true);
  }, []);

  function handleToggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        "text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-raised)] hover:text-[color:var(--color-text)]",
        className,
      )}
    >
      {mounted && theme === "dark" ? (
        <Sun className="size-[18px]" strokeWidth={1.8} />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.8} />
      )}
    </button>
  );
}
