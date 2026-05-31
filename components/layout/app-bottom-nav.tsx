"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Contact,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type TabKey = "dashboard" | "leads" | "customers" | "invoices" | "more";

type BottomTab = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
} & (
  | { kind: "link"; href: string }
  | { kind: "action" }
);

const TABS: BottomTab[] = [
  { key: "dashboard", kind: "link", href: "/", label: "Home", icon: LayoutDashboard },
  { key: "leads", kind: "link", href: "/leads", label: "Leads", icon: Users },
  { key: "customers", kind: "link", href: "/customers", label: "Customers", icon: Contact },
  { key: "invoices", kind: "link", href: "/invoices", label: "Invoices", icon: FileText },
  { key: "more", kind: "action", label: "More", icon: Menu },
];

type SecondaryItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

// Customers was promoted to a top-level bottom-nav tab; the chat trigger
// moved to the header (see app-header.tsx). The "More" sheet is now for
// less-frequently-used routes only.
const SECONDARY_ITEMS: SecondaryItem[] = [
  { href: "/catalog", label: "Catalog", icon: Package },
  { href: "/agent-chat", label: "Agent chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

const ADMIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Bottom navigation for mobile (`<md`). Renders nothing on `>=md` —
 * the desktop sidebar handles primary nav there.
 *
 * Tabs: Dashboard, Leads, Customers, Invoices, More (opens a bottom
 * sheet with Catalog, Settings, Admin). The chat trigger lives in the
 * header — see app-header.tsx — to avoid covering content with a
 * floating button.
 *
 * Visual: Ledger §7.12. Surface @ 88% with a 12px backdrop blur, top
 * 1px border, 26px bottom padding clears the iPhone home indicator
 * (env(safe-area-inset-bottom) adds extra runway where reported).
 * Active tab uses `--color-accent`.
 */
export function AppBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const visibleSecondary = SECONDARY_ITEMS.filter(
    (item) => !item.adminOnly || ADMIN_ENABLED
  );

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch md:hidden"
        style={{
          background: "color-mix(in oklch, var(--color-surface) 88%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid var(--color-border)",
          padding: "9px 8px calc(26px + env(safe-area-inset-bottom))",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.kind === "link"
              ? isActive(pathname, tab.href)
              : tab.key === "more"
                ? isMoreOpen
                : false;

          const className = cn(
            "flex flex-1 flex-col items-center justify-center gap-[3px] px-1 text-[10.5px] font-semibold transition-colors",
          );
          const colorStyle: React.CSSProperties = {
            color: active ? "var(--color-accent)" : "var(--color-text-faint)",
          };

          if (tab.kind === "link") {
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={className}
                style={colorStyle}
              >
                <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
                <span>{tab.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={tab.key}
              type="button"
              className={className}
              style={colorStyle}
              onClick={() => setIsMoreOpen(true)}
              aria-label={tab.label}
              aria-pressed={active}
            >
              <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent
          side="bottom"
          className="flex flex-col gap-0 rounded-t-[var(--ledger-radius-card)] bg-[color:var(--color-surface)] p-0"
        >
          <SheetHeader className="border-b border-[color:var(--color-border-subtle)] px-5 py-4">
            <SheetTitle className="text-[color:var(--color-text)]">More</SheetTitle>
          </SheetHeader>
          <ul
            className="flex flex-col py-2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            {visibleSecondary.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 px-5 py-3 text-[14px]",
                      active
                        ? "bg-shell-sidebar-active text-shell-sidebar-active-text font-semibold"
                        : "text-foreground hover:bg-shell-sidebar-hover"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
