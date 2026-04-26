"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAV_GROUPS, type SidebarNavItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

function SidebarNavLink({
  item,
  pathname,
  isMuted = false,
  onLinkClick,
}: {
  item: SidebarNavItem;
  pathname: string;
  isMuted?: boolean;
  onLinkClick?: () => void;
}) {
  const Icon = item.icon;
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onLinkClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
        isActive
          ? "bg-shell-sidebar-active text-shell-sidebar-active-text font-medium"
          : isMuted
            ? "text-primary hover:bg-shell-sidebar-hover hover:text-foreground"
            : "text-primary hover:bg-shell-sidebar-hover hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
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
                isMuted={group.key === "secondary"}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar (always visible ≥768px) ── */}
      <aside className="hidden w-60 shrink-0 border-r border-shell-border bg-shell-sidebar-bg md:flex md:flex-col">
        <SidebarNav />
      </aside>

      {/* ── Mobile overlay sidebar (<768px) ── */}
      {/* Backdrop */}
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
          onClick={onClose}
        />
      ) : null}

      {/* Drawer panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-shell-border bg-shell-sidebar-bg transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNav onLinkClick={onClose} />
      </aside>
    </>
  );
}