export type SidebarIconName = "dashboard" | "leads" | "Users";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: SidebarIconName;
};

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/leads", label: "Leads", icon: "leads" },
  { href: "/customers", label: "Customers", icon: "Users" },
];