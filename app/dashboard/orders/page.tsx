// src/app/dashboard/admin/orders/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

type PageProps = {
  searchParams?: Promise<{ status?: string; q?: string }>;
};

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDateBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function normalizeStatus(status?: string) {
  const v = (status ?? "").toUpperCase().trim();
  if (v === "PENDING" || v === "PAID" || v === "CANCELLED" || v === "REFUNDED") return v;
  return undefined;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const sp = (await searchParams) ?? {};
  const status = normalizeStatus(sp.status);
  const q = (sp.q ?? "").trim();

  const where: Prisma.OrderWhereInput = { deletedAt: null };

  if (status) where.status = status;

  // Busca por: id, email do guest, nome do guest, email do user, nome do user
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
      { guestFullName: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        status: true,
        totalCents: true,
        currency: true,
        user: { select: { name: true, email: true } },
        guestFullName: true,
        guestEmail: true,
      },
    }),

    prisma.order.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    }),
  ]);

  const statusCounts = {
    PENDING: 0,
    PAID: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  };

  for (const c of counts) {
    statusCounts[c.status] = c._count;
  }

  return (
    <section className="space-y-6 p-3 sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Pedidos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Lista e acompanhamento de pedidos</p>
        </div>

        <Link href="/dashboard/admin/dashboard" className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60">
          Voltar ao dashboard <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </header>

      {/* filtros rápidos */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatusFilter label={`Pendentes (${statusCounts.PENDING})`} href="/dashboard/admin/orders?status=PENDING" active={status === "PENDING"} />
        <StatusFilter label={`Pagos (${statusCounts.PAID})`} href="/dashboard/admin/orders?status=PAID" active={status === "PAID"} />
        <StatusFilter label={`Cancelados (${statusCounts.CANCELLED})`} href="/dashboard/admin/orders?status=CANCELLED" active={status === "CANCELLED"} />
        <StatusFilter label={`Reembolsados (${statusCounts.REFUNDED})`} href="/dashboard/admin/orders?status=REFUNDED" active={status === "REFUNDED"} />
      </div>

      {/* busca */}
      <form className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40">
            <Search className="h-4 w-4 text-neutral-500 dark:text-neutral-300" />
          </div>

          <input name="q" defaultValue={q} placeholder="Buscar por id, nome ou email…" className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-600" />

          {status ? <input type="hidden" name="status" value={status} /> : null}

          <button type="submit" className="h-10 rounded-xl bg-neutral-900 px-4 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            Buscar
          </button>
        </div>
      </form>

      {/* tabela */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold dark:border-neutral-800">Últimos pedidos</div>

        {orders.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-neutral-400">Nenhum pedido encontrado.</div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {orders.map((o) => {
              const customer = o.user?.name ?? o.user?.email ?? o.guestFullName ?? o.guestEmail ?? "Cliente";
              return (
                <Link key={o.id} href={`/dashboard/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{customer}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{formatDateBR(o.createdAt)} • #{o.id.slice(0, 8)}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrencyBRL(o.totalCents / 100)}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{o.currency}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function StatusFilter({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link href={href} className={active ? "rounded-2xl border border-neutral-300 bg-neutral-900 px-3 py-2 text-center text-xs font-medium text-white shadow-sm transition dark:border-neutral-700 dark:bg-white dark:text-neutral-900" : "rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-center text-xs font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/40"}>
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "PENDING"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300"
      : status === "PAID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300"
      : status === "CANCELLED"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
      : status === "REFUNDED"
      ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/20 dark:text-sky-300"
      : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200";

  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{status}</span>;
}
