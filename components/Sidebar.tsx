// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Session } from "next-auth";

import SignOutButton from "@/components/SignOutButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { SidebarNav } from "@/components/SidebarNav";

type SidebarProps = {
  user: Session["user"];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";

  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-neutral-900">
      {/* User */}
      <div className="p-6 border-b">
        <p className="font-semibold truncate">{user.name ?? "Usuário"}</p>
        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 text-sm">
        {SidebarNav.map(({ label, href, icon: Icon, adminOnly, customerOnly }) => {
          if (adminOnly && !isAdmin) return null;
          if (customerOnly && !isCustomer) return null;

          const active = pathname === href || pathname.startsWith(`${href}/`);

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

      {/* Categories */}
      <div className="p-4 border-t space-y-1 text-sm">
        <p className="font-semibold">Categorias</p>
        {loadingCategories ? (
          <div className="text-neutral-500 text-xs">Carregando categorias...</div>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-md transition",
                pathname === `/categories/${category.slug}`
                  ? "bg-neutral-100 dark:bg-neutral-800 font-medium"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
              ].join(" ")}
            >
              <span>{category.name}</span>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link
          href="/checkout"
          className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm"
        >
          <ShoppingCart size={18} />
          <span>Carrinho</span>
        </Link>
        <ThemeSwitcher />
        <SignOutButton className="w-full justify-start" />
      </div>
    </aside>
  );
}
