"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";

import SignOutButton from "@/components/SignOutButton";
import { SidebarNav } from "@/components/SidebarNav";

type SidebarProps = {
  user: Session["user"];
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-neutral-900">
      {/* User */}
      <div className="p-6 border-b">
        <p className="font-semibold truncate">
          {user.name ?? "Usuário"}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {user.email}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 text-sm">
        {SidebarNav.map(({ label, href, icon: Icon, adminOnly }) => {
          if (adminOnly && !isAdmin) return null;

          const active =
            pathname === href || pathname.startsWith(`${href}/`);

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

      {/* Footer */}
      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </aside>
  );
}
