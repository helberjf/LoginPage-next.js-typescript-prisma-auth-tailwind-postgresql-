// app/dashboard/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

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
    <section className="max-w-7xl mx-auto px-4 py-2">
      {/* Breadcrumbs sempre disponíveis no dashboard */}
      <Breadcrumbs />

      {/* Conteúdo da página */}
      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}
