// src/components/SidebarMobile.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Package,
  Search,
  ShoppingCart,
  User,
  Users,
  X,
  Wrench,
  Box,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import type { NavItem } from "@/sidebar.config";
import { useSidebar } from "@/contexts/SidebarContext";

type SidebarMobileProps = {
  items: NavItem[];
  footer?: React.ReactNode;
};

export default function SidebarMobile({ items, footer }: SidebarMobileProps) {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();

  const iconMap: Record<string, React.ElementType> = {
    "calendar": Calendar,
    "clipboard-list": ClipboardList,
    "credit-card": CreditCard,
    "home": Home,
    "layout": LayoutDashboard,
    "box": Box,
    "package": Package,
    "search": Search,
    "shopping-cart": ShoppingCart,
    "user": User,
    "users": Users,
    "wrench": Wrench,
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeSidebar]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <motion.button aria-label="Fechar menu" className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-[2px]" onClick={closeSidebar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />

            <motion.aside className="absolute left-0 top-0 bottom-0 w-[82vw] max-w-[320px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col shadow-2xl" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <header className="flex items-center justify-between mb-4">
                <div className="font-semibold">Menu</div>
                <button aria-label="Fechar menu" onClick={closeSidebar} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600">
                  <X size={18} />
                </button>
              </header>

              <nav className="flex-1 flex flex-col gap-1 text-sm overflow-y-auto pr-1">
                {items.map(({ label, href, icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  const Icon = iconMap[icon] ?? Package;

                  return (
                    <Link key={href} href={href} onClick={closeSidebar} className={active ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium transition" : "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"}>
                      <Icon size={16} />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {footer && (
                <footer className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                  {footer}
                </footer>
              )}

            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}