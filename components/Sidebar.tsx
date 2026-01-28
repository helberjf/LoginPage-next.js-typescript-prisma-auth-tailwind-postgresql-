// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Bell,
  Package,
  Search,
  ShoppingCart,
  User,
  Users,
  Wrench,
  Box,
} from "lucide-react";
import type { NavItem } from "@/sidebar.config";

type SidebarProps = {
  items: NavItem[];
  footer?: React.ReactNode;
};

export default function Sidebar({ items, footer }: SidebarProps) {
  const pathname = usePathname();

  const iconMap: Record<string, React.ElementType> = {
    "calendar": Calendar,
    "clipboard-list": ClipboardList,
    "credit-card": CreditCard,
    "home": Home,
    "layout": LayoutDashboard,
    "bell": Bell,
    "box": Box,
    "package": Package,
    "search": Search,
    "shopping-cart": ShoppingCart,
    "user": User,
    "users": Users,
    "wrench": Wrench,
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-neutral-900">
      <nav className="flex-1 p-4 space-y-1 text-sm">
        {items.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = iconMap[icon] ?? Package;

          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-md transition",
                active
                  ? "bg-neutral-100 dark:bg-neutral-800 font-medium"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
              ].join(" ")}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {footer && <div className="p-4 border-t space-y-2">{footer}</div>}
    </aside>
  );
}
