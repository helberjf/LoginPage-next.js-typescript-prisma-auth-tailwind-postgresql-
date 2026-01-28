import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CreateOrderForm from "@/components/admin/CreateOrderForm";

async function getCustomers() {
  return prisma.user.findMany({
    where: { role: "CUSTOMER", status: "ACTIVE" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

async function getProducts() {
  return prisma.product.findMany({
    where: { active: true, deletedAt: null },
    select: { id: true, name: true, priceCents: true },
    orderBy: { name: "asc" },
  });
}

export default async function AdminCreateOrderPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [customers, products] = await Promise.all([
    getCustomers(),
    getProducts(),
  ]);

  return (
    <section className="space-y-4 p-3 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Criar pedido</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Crie pedidos manuais com produtos e dados do cliente.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CreateOrderForm customers={customers} products={products} />
      </div>

      <div>
        <Link
          href="/dashboard/admin/orders"
          className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Voltar para pedidos
        </Link>
      </div>
    </section>
  );
}
