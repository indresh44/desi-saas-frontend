"use client";

import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/constants/app";
import { useAuth } from "@/lib/auth/auth-context";
import { useChat } from "@/lib/chat/chat-context";
import { LedgerButton, LedgerThemeToggle, Mono } from "@/components/ledger";
import { cn } from "@/lib/utils";

/**
 * Two-letter initials for the user avatar tile (§7.14). Falls back to
 * a single character or "?" for unknown users so the tile never blanks.
 */
function userInitials(name: string | null | undefined): string {
  const raw = (name ?? "").trim();
  if (!raw) return "?";
  const parts = raw.split(/\s+/);
  const first = parts[0][0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return ((first + second) || raw.slice(0, 2)).toUpperCase();
}

/**
 * App top bar — Ledger §7.14. 58px tall, surface bg, bottom border.
 * Layout: workspace label · spacer · Ask AI pill · moon · user block + avatar · logout.
 *
 * The moon toggle is sourced from `LedgerThemeToggle` so the theme-flip
 * code lives in one place; this header only owns the workspace label,
 * the Ask AI pill (wired to the chat drawer), the user block, and the
 * logout action.
 */
export function AppHeader() {
  const { user, business, logout } = useAuth();
  const { isOpen: isChatOpen, toggleChat } = useChat();

  const workspaceName = business?.name ?? APP_NAME;

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur"
      style={{
        background: "color-mix(in oklch, var(--color-surface) 92%, transparent)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="flex h-[58px] items-center justify-between gap-3 px-4 md:px-6">
        {/* Workspace label — business name (terracotta, the one place
            outside primary actions/active nav where the accent appears)
            stacked over a quieter mono workspace sub-label. */}
        <div className="min-w-0 leading-tight">
          <div
            className="truncate text-[18px] font-bold tracking-[-0.015em]"
            style={{ color: "var(--color-accent)" }}
          >
            {workspaceName}
          </div>
          <Mono
            as="div"
            className="truncate text-[11px] font-medium"
            style={{ color: "var(--color-text-faint)" }}
          >
            {APP_NAME} workspace
          </Mono>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Ask AI pill — §7.14. Tinted accent-soft surface so it reads
              as the screen's one AI affordance, not "another menu". */}
          <button
            type="button"
            onClick={toggleChat}
            aria-label={isChatOpen ? "Close AI assistant" : "Open AI assistant"}
            aria-pressed={isChatOpen}
            className={cn(
              "inline-flex min-h-11 items-center gap-[7px] text-[13px] font-semibold transition-colors md:min-h-9",
            )}
            style={{
              height: 34,
              padding: "0 14px",
              borderRadius: "var(--ledger-radius-pill)",
              background: "var(--color-accent-soft)",
              color: "var(--color-accent)",
              border: "1px solid color-mix(in oklch, var(--color-accent) 22%, transparent)",
            }}
          >
            <Sparkles className="size-[15px]" aria-hidden strokeWidth={1.8} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          <LedgerThemeToggle />

          {/* User block — hidden below sm. Avatar always shows. */}
          {user ? (
            <div className="hidden items-center gap-[10px] md:flex">
              <div className="text-right leading-tight">
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {user.name ?? "User"}
                </p>
                <Mono
                  as="p"
                  className="text-[11px]"
                  style={{ color: "var(--color-text-faint)" }}
                >
                  {user.email ?? ""}
                </Mono>
              </div>
              <div
                aria-hidden
                className="grid place-items-center text-[13px] font-semibold"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent)",
                  border: "1px solid color-mix(in oklch, var(--color-accent) 18%, transparent)",
                }}
              >
                {userInitials(user.name)}
              </div>
            </div>
          ) : null}

          <LedgerButton variant="action" size="sm" onClick={() => void logout()}>
            Logout
          </LedgerButton>
        </div>
      </div>
    </header>
  );
}
