"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  User,
  Package,
  Boxes,
  Users,
  Plus,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  customerOnly?: boolean;
};

export const SidebarNav: SidebarItem[] = [
  // CLIENTE
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    customerOnly: true,
  },
  {
    label: "Dashboard Admin",
    href: "/dashboard/admin/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    label: "Produtos",
    href: "/products",
    icon: Boxes,
    customerOnly: true,
  },
  {
    label: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    customerOnly: true,
  },
  {
    label: "Pagamentos",
    href: "/dashboard/payments",
    icon: CreditCard,
    customerOnly: true,
  },
  {
    label: "Perfil",
    href: "/dashboard/profile",
    icon: User,
  },

  // ADMIN
  {
    label: "Gerenciar Produtos",
    href: "/dashboard/admin/products",
    icon: Package,
    adminOnly: true,
  },
  {
    label: "Adicionar Produtos",
    href: "/dashboard/admin/products/new",
    icon: Plus,
    adminOnly: true,
  },
  {
    label: "Usuários",
    href: "/dashboard/admin/users",
    icon: Users,
    adminOnly: true,
  },
];
