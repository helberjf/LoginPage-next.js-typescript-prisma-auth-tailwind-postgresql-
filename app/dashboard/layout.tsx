// src/app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar'
import SidebarMobile from '@/components/SidebarMobile'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Segurança extra: middleware já protege, mas double-check é comum
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-neutral-100 dark:bg-neutral-900">
      <Sidebar user={session.user as any} />
      <SidebarMobile user={session.user as any} />

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
