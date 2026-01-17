// app/dashboard/admin/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
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
