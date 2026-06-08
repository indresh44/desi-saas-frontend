"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_GROUPS, type SidebarNavItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

function SidebarNavLink({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-[11px] rounded-[var(--ledger-radius-sm)] px-[11px] py-[9px] text-[14px] transition-colors",
        isActive
          ? "bg-shell-sidebar-active text-shell-sidebar-active-text font-semibold"
          : "text-shell-sidebar-text hover:bg-shell-sidebar-hover hover:text-foreground"
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.7} />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-[14px] pb-4 pt-4">
      {SIDEBAR_NAV_GROUPS.map((group, index) => (
        <div
          key={group.key}
          className={cn(
            index > 0 && "mt-3 border-t pt-3",
          )}
          style={index > 0 ? { borderColor: "var(--color-border-subtle)" } : undefined}
        >
          <div className="space-y-1">
            {group.items.map((item) => (
              <SidebarNavLink
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

/**
 * Desktop-only sidebar (`>=md`) — Ledger §7.2. Brand block + nav.
 * Mobile uses `AppBottomNav` instead of a drawer (see mobile UX plan).
 */
export function AppSidebar() {
  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-shell-border bg-shell-sidebar-bg md:flex md:flex-col">
      <SidebarNav />
    </aside>
  );
}
