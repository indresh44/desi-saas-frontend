"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
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
import { useChat } from "@/lib/chat/chat-context";
import { cn } from "@/lib/utils";

type TabKey = "dashboard" | "leads" | "chat" | "invoices" | "more";

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
  { key: "chat", kind: "action", label: "Chat", icon: MessageSquare },
  { key: "invoices", kind: "link", href: "/invoices", label: "Invoices", icon: FileText },
  { key: "more", kind: "action", label: "More", icon: Menu },
];

type SecondaryItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const SECONDARY_ITEMS: SecondaryItem[] = [
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/catalog", label: "Catalog", icon: Package },
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
 * Tabs: Dashboard, Leads, Chat (toggles AI panel), Invoices, More
 * (opens a bottom sheet with Customers, Catalog, Settings, Admin).
 *
 * Active state matches `app-sidebar.tsx` styling for visual consistency.
 * Safe-area inset is applied so the bar clears the iPhone home indicator.
 */
export function AppBottomNav() {
  const pathname = usePathname();
  const { isOpen: isChatOpen, toggleChat } = useChat();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const visibleSecondary = SECONDARY_ITEMS.filter(
    (item) => !item.adminOnly || ADMIN_ENABLED
  );

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-shell-border bg-shell-sidebar-bg md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.kind === "link"
              ? isActive(pathname, tab.href)
              : tab.key === "chat"
                ? isChatOpen
                : tab.key === "more"
                  ? isMoreOpen
                  : false;

          const className = cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[11px] font-medium transition-colors",
            active
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          );

          if (tab.kind === "link") {
            return (
              <Link key={tab.key} href={tab.href} className={className}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{tab.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={tab.key}
              type="button"
              className={className}
              onClick={() => {
                if (tab.key === "chat") {
                  toggleChat();
                } else if (tab.key === "more") {
                  setIsMoreOpen(true);
                }
              }}
              aria-label={tab.label}
              aria-pressed={active}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent
          side="bottom"
          className="flex flex-col gap-0 rounded-t-2xl p-0"
        >
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>More</SheetTitle>
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
                      "flex min-h-12 items-center gap-3 px-5 py-3 text-sm",
                      active
                        ? "bg-shell-sidebar-active text-shell-sidebar-active-text font-medium"
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
