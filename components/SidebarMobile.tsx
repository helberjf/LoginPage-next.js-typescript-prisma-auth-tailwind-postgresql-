"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Session } from "next-auth";
import SignOutButton from "@/components/SignOutButton";
import { SidebarNav } from "@/components/SidebarNav";

type SidebarMobileProps = {
  user: Session["user"];
};

export default function SidebarMobile({ user }: SidebarMobileProps) {
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      {!open && (
        <button
          aria-label="Abrir menu"
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-neutral-800 rounded-md shadow"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-900 p-4 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-medium">
                  {(user.name || "U").charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {user.name ?? "Usuário"}
                  </div>
                  <div className="text-xs text-neutral-500 truncate">
                    {user.email ?? ""}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="p-1"
              >
                <X size={20} />
              </button>
            </header>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1 text-sm">
              {SidebarNav.map(({ label, href, icon: Icon, adminOnly }) => {
                if (adminOnly && !isAdmin) return null;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <footer className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <SignOutButton className="w-full text-left" />
              <div className="mt-2 text-xs text-neutral-500">
                Role:{" "}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {user.role}
                </span>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
