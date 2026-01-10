// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  User,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

type SidebarProps = {
  user: Session["user"];
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-neutral-900">
      {/* User */}
      <div className="p-6 border-b">
        <p className="font-semibold">
          {user.name ?? "Usuário"}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {user.email}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 text-sm">
        <SidebarLink
          href="/dashboard"
          label="Dashboard"
          icon={<LayoutDashboard size={16} />}
          active={pathname === "/dashboard"}
        />

        <SidebarLink
          href="/dashboard/orders"
          label="Pedidos"
          icon={<ShoppingCart size={16} />}
          active={pathname.startsWith("/dashboard/orders")}
        />

        <SidebarLink
          href="/dashboard/payments"
          label="Pagamentos"
          icon={<CreditCard size={16} />}
          active={pathname.startsWith("/dashboard/payments")}
        />

        <SidebarLink
          href="/dashboard/profile"
          label="Perfil"
          icon={<User size={16} />}
          active={pathname.startsWith("/dashboard/profile")}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 px-3 py-2 rounded-md transition",
        active
          ? "bg-neutral-100 dark:bg-neutral-800 font-medium"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
