import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from "lucide-react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/catalog", label: "Catalog", icon: Package },
  { href: "/meetings", label: "Meetings", icon: Calendar },
];

export const SIDEBAR_SECONDARY_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];