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
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
        isActive
          ? "bg-shell-sidebar-active text-shell-sidebar-active-text font-medium"
          : "text-primary hover:bg-shell-sidebar-hover hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-3">
      {SIDEBAR_NAV_GROUPS.map((group, index) => (
        <div
          key={group.key}
          className={cn(index > 0 && "mt-2 border-t border-shell-border pt-2")}
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
 * Desktop-only sidebar (`>=md`). Mobile uses the bottom nav in
 * `app-bottom-nav.tsx` instead of a drawer — see the mobile UX plan.
 */
export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-shell-border bg-shell-sidebar-bg md:flex md:flex-col">
      <SidebarNav />
    </aside>
  );
}