"use client";

import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  User,
  Heart,
  Package,
  Boxes,
  Users,
  Plus,
  LogOut,
  Calendar,
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
    label: "Produtos",
    href: "/products",
    icon: Boxes,
    customerOnly: true,
  },
  {
    label: "Meus favoritos",
    href: "/wishlist",
    icon: Heart,
    customerOnly: true,
  },
  {
    label: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    customerOnly: true,
  },
  {
    label: "Agendamentos",
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
    label: "Dashboard Admin",
    href: "/dashboard/admin/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
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
  {
    label: "Pedidos",
    href: "/dashboard/admin/orders",
    icon: ShoppingCart,
    adminOnly: true,
  },
  {
    label: "Sair",
    href: "/api/auth/signout",
    icon: LogOut,
    adminOnly: true,
  },
];
