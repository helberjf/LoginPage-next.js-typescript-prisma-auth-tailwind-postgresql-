// src/app/dashboard/admin/dashboard/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, AlertTriangle, Package, ShoppingCart, Users } from "lucide-react";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDateBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [
    productsCount,
    activeProductsCount,
    outOfStockCount,

    usersCount,
    activeUsersCount,
    blockedUsersCount,

    pendingOrdersCount,
    paidOrdersCount,
    cancelledOrdersCount,

    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { active: true, deletedAt: null } }),
    prisma.product.count({ where: { stock: { lte: 0 }, active: true, deletedAt: null } }),

    prisma.user.count({ where: { status: { not: "DELETED" } } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "BLOCKED" } }),

    prisma.order.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.order.count({ where: { status: "PAID", deletedAt: null } }),
    prisma.order.count({ where: { status: "CANCELLED", deletedAt: null } }),

    prisma.order.aggregate({
      where: { status: "PAID", deletedAt: null },
      _sum: { totalCents: true },
    }),

    prisma.order.findMany({
      where: { deletedAt: null },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        guestFullName: true,
        guestEmail: true,
      },
    }),
  ]);

  const revenue = (revenueAgg._sum.totalCents ?? 0) / 100;

  return (
    <section className="space-y-6 p-3 sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dashboard Admin</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Visão geral do sistema</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/admin/products/new" className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            Novo Produto <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/dashboard/admin/products" className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60">
            Produtos <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Produtos" value={productsCount.toString()} subtitle={`${activeProductsCount} ativos • ${outOfStockCount} sem estoque`} href="/dashboard/admin/products" icon={<Package className="h-5 w-5" />} />
        <KpiCard title="Vendas" value={formatCurrencyBRL(revenue)} subtitle={`${paidOrdersCount} pedidos pagos`} href="/dashboard/admin/orders" icon={<ShoppingCart className="h-5 w-5" />} />
        <KpiCard title="Usuários" value={usersCount.toString()} subtitle={`${activeUsersCount} ativos • ${blockedUsersCount} bloqueados`} href="/dashboard/admin/users" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Pendências" value={pendingOrdersCount.toString()} subtitle={`${cancelledOrdersCount} cancelados`} href="/dashboard/admin/orders?status=PENDING" icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pedidos recentes</h2>
            <Link href="/dashboard/admin/orders" className="text-xs font-medium text-neutral-600 hover:underline dark:text-neutral-300">
              Ver todos
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState message="Nenhum pedido registrado ainda." />
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const customerName = order.user?.name ?? order.user?.email ?? order.guestFullName ?? order.guestEmail ?? "Cliente";

                return (
                  <Link key={order.id} href={`/dashboard/admin/orders/${order.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-3 py-3 text-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{customerName}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{formatDateBR(order.createdAt)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrencyBRL(order.totalCents / 100)}</div>
                      <div className="text-xs text-neutral-500">#{order.id.slice(0, 8)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold">Ações rápidas</h2>

          <div className="space-y-2">
            <QuickAction href="/dashboard/admin/products/new" label="Novo Produto" />
            <QuickAction href="/dashboard/admin/products" label="Gerenciar Produtos" />
            <QuickAction href="/dashboard/admin/orders" label="Pedidos" />
            <QuickAction href="/dashboard/admin/users" label="Usuários" />
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/30 dark:text-neutral-300">
            KPI “Sem estoque” evita checkout quebrado.
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  href,
  tone = "normal",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  tone?: "normal" | "warning";
}) {
  return (
    <Link href={href} className={["group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-neutral-900", "border-neutral-200 dark:border-neutral-800", tone === "warning" ? "hover:border-amber-300 dark:hover:border-amber-700" : ""].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-2 text-neutral-700 transition group-hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200 dark:group-hover:bg-neutral-800">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between w-full rounded-2xl border border-neutral-200 px-3 py-2 text-xs font-medium transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
      {label}
      <ArrowUpRight className="h-4 w-4 text-neutral-400" />
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="flex h-28 items-center justify-center text-xs text-neutral-400">{message}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "PENDING"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300"
      : status === "PAID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300"
      : status === "CANCELLED" || status === "REFUNDED"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
      : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200";

  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{status}</span>;
}
