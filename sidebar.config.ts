export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const publicSidebar: NavItem[] = [
  { label: "Início", href: "/", icon: "home" },
  { label: "Produtos", href: "/products", icon: "package" },
  { label: "Agendar serviços", href: "/services", icon: "calendar" },
  { label: "Categorias", href: "/categories", icon: "grid" },
  { label: "Carrinho", href: "/checkout", icon: "shopping-cart" },
  { label: "Buscar Pedido", href: "/order/search", icon: "search" },
  { label: "Contato", href: "/contact", icon: "mail" },
  { label: "WhatsApp", href: "https://wa.me/5532991949689", icon: "whatsapp" },
];

export const customerSidebar: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "layout" },
  { label: "Produtos", href: "/products", icon: "package" },
  { label: "Agendar serviços", href: "/services", icon: "calendar" },
  { label: "Notificações", href: "/dashboard/notifications", icon: "bell" },
  { label: "Categorias", href: "/categories", icon: "grid" },
  { label: "Meus favoritos", href: "/wishlist", icon: "heart" },
  { label: "Meus Pedidos", href: "/dashboard/orders", icon: "package" },
  { label: "Pagamentos", href: "/dashboard/payments", icon: "credit-card" },
  { label: "Perfil", href: "/dashboard/profile", icon: "user" },
  { label: "Contato", href: "/contact", icon: "mail" },
  { label: "WhatsApp", href: "https://wa.me/5532991949689", icon: "whatsapp" },
];

export const staffSidebar: NavItem[] = [
  { label: "Notificações", href: "/dashboard/staff/notifications", icon: "bell" },
  { label: "Atendimentos", href: "/dashboard/staff/services", icon: "clipboard-list" },
  { label: "Categorias", href: "/categories", icon: "grid" },
  { label: "Controle de Atendimentos", href: "/dashboard/attendance", icon: "clipboard-list" },
  { label: "Estoque", href: "/dashboard/inventory", icon: "warehouse" },
  { label: "WhatsApp", href: "https://wa.me/5532991949689", icon: "whatsapp" },
];

export const adminSidebar: NavItem[] = [
  { label: "Dashboard Admin", href: "/dashboard/admin/dashboard", icon: "layout" },
  { label: "Notificações", href: "/dashboard/admin/notifications", icon: "bell" },
  { label: "Pedidos", href: "/dashboard/admin/orders", icon: "package" },
  { label: "Gerenciar Produtos", href: "/dashboard/admin/products", icon: "box" },
  { label: "Adicionar Produtos", href: "/dashboard/admin/products/new", icon: "package" },
  { label: "Categorias", href: "/categories", icon: "grid" },
  { label: "Meus Serviços", href: "/dashboard/admin/services", icon: "wrench" },
  { label: "Usuários", href: "/dashboard/admin/users", icon: "users" },
  { label: "Controle de Atendimentos", href: "/dashboard/attendance", icon: "clipboard-list" },
  { label: "Estoque", href: "/dashboard/inventory", icon: "warehouse" },
  { label: "WhatsApp", href: "https://wa.me/5532991949689", icon: "whatsapp" },
];
