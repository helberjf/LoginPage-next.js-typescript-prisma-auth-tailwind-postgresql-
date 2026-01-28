export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const publicSidebar: NavItem[] = [
  { label: "Início", href: "/", icon: "home" },
  { label: "Produtos", href: "/products", icon: "package" },
  { label: "Serviços", href: "/services", icon: "wrench" },
  { label: "Agendar", href: "/schedules", icon: "calendar" },
  { label: "Carrinho", href: "/checkout", icon: "shopping-cart" },
  { label: "Buscar Pedido", href: "/order/search", icon: "search" },
];

export const customerSidebar: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "layout" },
  { label: "Notificações", href: "/dashboard/notifications", icon: "bell" },
  { label: "Produtos", href: "/products", icon: "package" },
  { label: "Serviços", href: "/services", icon: "wrench" },
  { label: "Agendar Serviço", href: "/schedules", icon: "calendar" },
  { label: "Meus Pedidos", href: "/dashboard/orders", icon: "package" },
  { label: "Meus Agendamentos", href: "/dashboard/schedules", icon: "calendar" },
  { label: "Pagamentos", href: "/dashboard/payments", icon: "credit-card" },
  { label: "Perfil", href: "/dashboard/profile", icon: "user" },
];

export const staffSidebar: NavItem[] = [
  { label: "Notificações", href: "/dashboard/staff/notifications", icon: "bell" },
  { label: "Agenda", href: "/dashboard/staff/agenda", icon: "calendar" },
  { label: "Atendimentos", href: "/dashboard/staff/services", icon: "clipboard-list" },
];

export const adminSidebar: NavItem[] = [
  { label: "Dashboard Admin", href: "/dashboard/admin/dashboard", icon: "layout" },
  { label: "Notificações", href: "/dashboard/admin/notifications", icon: "bell" },
  { label: "Pedidos", href: "/dashboard/admin/orders", icon: "package" },
  { label: "Agendamentos", href: "/dashboard/admin/schedules", icon: "calendar" },
  { label: "Criar agendamento", href: "/dashboard/admin/schedules/bookSchedules", icon: "calendar" },
  { label: "Gerenciar Produtos", href: "/dashboard/admin/products", icon: "box" },
  { label: "Adicionar Produtos", href: "/dashboard/admin/products/new", icon: "package" },
  { label: "Meus Serviços", href: "/dashboard/admin/services", icon: "wrench" },
  { label: "Usuários", href: "/dashboard/admin/users", icon: "users" },
];
