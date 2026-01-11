// app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="h-screen bg-neutral-100 dark:bg-neutral-900 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={session.user} />
      <SidebarMobile user={session.user} />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <header className="h-14 shrink-0 border-b bg-white dark:bg-neutral-900 pl-16 pr-6 md:px-6 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {session.user.name ?? "Usuário"}
            </span>
            <span className="text-xs text-neutral-500">
              Dashboard
            </span>
          </div>

          <SignOutButton />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
