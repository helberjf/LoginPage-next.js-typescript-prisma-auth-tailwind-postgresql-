import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  User,
  LifeBuoy,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

export const sidebarNav: NavItem[] = [
  // User
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Orders",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Support",
    href: "/support",
    icon: LifeBuoy,
  },

  // Admin
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    adminOnly: true,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    adminOnly: true,
  },
  {
    label: "Customers",
    href: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    adminOnly: true,
  },
];
