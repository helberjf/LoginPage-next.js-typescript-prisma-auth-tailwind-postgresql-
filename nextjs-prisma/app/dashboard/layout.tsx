// src/app/(dashboard)/layout.tsx
import { auth } from "../../../my-app/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Segurança extra: middleware já protege, mas double-check é comum
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-100 dark:bg-neutral-900">
      {/* Sidebar */}
      <aside className="w-64 p-6 border-r border-neutral-300 dark:border-neutral-800 hidden md:block">
        <h2 className="font-bold text-xl mb-4">Dashboard</h2>
        <nav className="flex flex-col gap-2 text-sm">
          <a href="/dashboard" className="hover:underline">
            Home
          </a>
          <a href="/profile" className="hover:underline opacity-50">
            Perfil (exemplo)
          </a>
          <a href="/api/auth/signout" className="hover:underline text-red-600">
            Sair
          </a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
