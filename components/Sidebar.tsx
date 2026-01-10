"use client";

import Link from "next/link";
import { Session } from "next-auth";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  User,
} from "lucide-react";
import SignOutButton from "@/components/signOutButton";

type SidebarProps = {
  user: Session["user"];
};

export default function Sidebar({ user }: SidebarProps) {
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
          icon={<LayoutDashboard size={16} />}
          label="Dashboard"
        />
        <SidebarLink
          href="/dashboard/orders"
          icon={<ShoppingCart size={16} />}
          label="Pedidos"
        />
        <SidebarLink
          href="/dashboard/payments"
          icon={<CreditCard size={16} />}
          label="Pagamentos"
        />
        <SidebarLink
          href="/dashboard/profile"
          icon={<User size={16} />}
          label="Perfil"
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
