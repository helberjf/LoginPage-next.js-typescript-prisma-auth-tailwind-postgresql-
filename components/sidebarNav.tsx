import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  User,
  Package,
  Boxes,
  Users,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

/**
 * Fonte única de verdade da navegação
 * Desktop e Mobile usam ESTE arquivo
 */
export const sidebarNav: SidebarItem[] = [
  // CLIENTE
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Produtos",
    href: "/products", // catálogo público / comparação
    icon: Boxes,
  },
  {
    label: "Pedidos",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    label: "Pagamentos",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    label: "Perfil",
    href: "/dashboard/profile",
    icon: User,
  },

  // ADMIN
  {
    label: "Gerenciar Produtos",
    href: "/admin/products",
    icon: Package,
    adminOnly: true,
  },
  {
    label: "Usuários",
    href: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
];
