// app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";
import SignOutButton from "@/components/SignOutButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { adminSidebar, customerSidebar, staffSidebar } from "@/sidebar.config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const items =
    role === "ADMIN"
      ? adminSidebar
      : role === "STAFF"
        ? staffSidebar
        : role === "CUSTOMER"
          ? customerSidebar
          : null;

  if (!items) {
    redirect("/");
  }

  return (
    <div className="h-screen bg-neutral-50 dark:bg-neutral-950 flex overflow-hidden">
      {/* Sidebar (desktop) */}
      <Sidebar
        items={items}
        footer={
          <>
            <ThemeSwitcher />
            <SignOutButton className="w-full justify-start" />
          </>
        }
      />
      <SidebarMobile
        items={items}
        footer={
          <>
            <ThemeSwitcher />
            <SignOutButton className="w-full justify-start" />
          </>
        }
      />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-20 h-14 shrink-0 border-b bg-white/90 dark:bg-neutral-950/90 backdrop-blur supports-backdrop-filter:bg-white/70 pl-16 pr-4 md:px-6 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              Dashboard
            </span>
            <span className="text-xs text-neutral-500">
              Área autenticada
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
