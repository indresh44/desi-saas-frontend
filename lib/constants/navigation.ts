import type { LucideIcon } from "lucide-react";
import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SidebarNavGroup = {
  key: "primary" | "secondary" | "admin";
  items: SidebarNavItem[];
};

const ADMIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true";

const BASE_GROUPS: SidebarNavGroup[] = [
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
      { href: "/agent-chat", label: "Agent chat", icon: MessageSquare },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const ADMIN_GROUP: SidebarNavGroup = {
  key: "admin",
  items: [{ href: "/admin", label: "Admin", icon: Shield }],
};

// Admin nav link is rendered only in the local dev build with
// NEXT_PUBLIC_ENABLE_ADMIN=true. Production builds never set the flag,
// so the link doesn't ship. The real gate is server-side — see
// app/api/admin/dependencies.py.
export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = ADMIN_ENABLED
  ? [...BASE_GROUPS, ADMIN_GROUP]
  : BASE_GROUPS;