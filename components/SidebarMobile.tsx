// src/components/SidebarMobile.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Session } from "next-auth";
import { AnimatePresence, motion } from "framer-motion";

import { SidebarNav } from "@/components/SidebarNav";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import SignOutButton from "@/components/SignOutButton";

type SidebarMobileProps = {
  user: Session["user"];
};

export default function SidebarMobile({ user }: SidebarMobileProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = user.role === "ADMIN";
  const isCustomer = user.role === "CUSTOMER";

  const items = useMemo(() => {
    return SidebarNav.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.customerOnly && !isCustomer) return false;
      return true;
    });
  }, [isAdmin, isCustomer]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const initial = (user.name || "U").trim().charAt(0).toUpperCase();

  return (
    <>
      {!open && (
        <button aria-label="Abrir menu" onClick={() => setOpen(true)} className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-sm hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600">
          <Menu size={20} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <motion.button aria-label="Fechar menu" className="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />

            <motion.aside className="absolute left-0 top-0 bottom-0 w-[82vw] max-w-[320px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col shadow-2xl" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">{user.name ?? "Usuário"}</div>
                    <div className="text-xs text-neutral-500 truncate">{user.email ?? ""}</div>
                  </div>
                </div>

                <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600">
                  <X size={18} />
                </button>
              </header>

              <nav className="flex-1 flex flex-col gap-1 text-sm overflow-y-auto pr-1">
                {items.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)} className={active ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium transition" : "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"}>
                      <Icon size={16} />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              <footer className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <ThemeSwitcher />
                <SignOutButton className="w-full justify-start" />
                <div className="pt-2 text-xs text-neutral-500">
                  Role: <span className="font-medium text-neutral-700 dark:text-neutral-300">{user.role}</span>
                </div>
              </footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
