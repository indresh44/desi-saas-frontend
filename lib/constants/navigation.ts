import type { LucideIcon } from "lucide-react";
import {
  FileText,
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

export type SidebarNavGroup = {
  key: "primary" | "secondary";
  items: SidebarNavItem[];
};

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    key: "primary",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: Users },
    ],
  },
  {
    key: "secondary",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/invoices", label: "Invoices", icon: FileText },
      { href: "/catalog", label: "Catalog", icon: Package },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];