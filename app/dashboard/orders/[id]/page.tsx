// src/app/dashboard/admin/orders/[id]/page.tsx

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Package } from "lucide-react";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDateBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(date);
}

export default async function AdminOrderDetailsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      updatedAt: true,

      user: { select: { id: true, name: true, email: true } },
      guestFullName: true,
      guestEmail: true,
      guestCpf: true,
      guestPhone: true,

      items: {
        select: {
          id: true,
          quantity: true,
          priceCents: true,
          product: { select: { id: true, name: true, priceCents: true } },
        },
      },

      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          method: true,
          status: true,
          amountCents: true,
          mpPaymentId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) notFound();

  const customerName = order.user?.name ?? order.user?.email ?? order.guestFullName ?? order.guestEmail ?? "Cliente";

  const subtotalCents = order.items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);
  const totalCents = order.totalCents;

  return (
    <section className="space-y-6 p-3 sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Pedido</h1>
            <span className="text-sm text-neutral-500">#{order.id.slice(0, 8)}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Criado em {formatDateBR(order.createdAt)}</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/admin/orders" className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>

          <Link href="/dashboard/admin/dashboard" className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            Dashboard <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Itens */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold">Itens do pedido</h2>

          {order.items.length === 0 ? (
            <div className="flex h-28 items-center justify-center text-sm text-neutral-400">Nenhum item.</div>
          ) : (
            <div className="space-y-2">
              {order.items.map((it) => {
                const lineTotal = (it.priceCents * it.quantity) / 100;

                return (
                  <div key={it.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-3 py-3 text-sm dark:border-neutral-800">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-neutral-500" />
                        <span className="font-medium truncate">{it.product.name}</span>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Quantidade: {it.quantity} • Unitário: {formatCurrencyBRL(it.priceCents / 100)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrencyBRL(lineTotal)}</div>
                      <div className="text-xs text-neutral-500">#{it.product.id.slice(0, 8)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo / Cliente / Pagamento */}
        <div className="space-y-4">
          {/* Cliente */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold">Cliente</h2>

            <div className="space-y-2 text-sm">
              <div className="rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="font-medium truncate">{customerName}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {order.user?.email ?? order.guestEmail ?? "Sem email"}
                </div>
              </div>

              {order.guestCpf ? (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  CPF: <span className="text-neutral-700 dark:text-neutral-300">{order.guestCpf}</span>
                </div>
              ) : null}

              {order.guestPhone ? (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Telefone: <span className="text-neutral-700 dark:text-neutral-300">{order.guestPhone}</span>
                </div>
              ) : null}

              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Atualizado em <span className="text-neutral-700 dark:text-neutral-300">{formatDateBR(order.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Pagamentos */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold">Pagamentos</h2>

            {order.payments.length === 0 ? (
              <div className="text-sm text-neutral-400">Nenhum pagamento registrado.</div>
            ) : (
              <div className="space-y-2">
                {order.payments.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{p.method}</span>
                      <PaymentBadge status={p.status} />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDateBR(p.createdAt)} • {formatCurrencyBRL(p.amountCents / 100)}
                    </div>
                    {p.mpPaymentId ? <div className="mt-1 text-xs text-neutral-500">mpPaymentId: {p.mpPaymentId}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totais */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold">Resumo</h2>

            <div className="space-y-2 text-sm">
              <Row label="Subtotal itens" value={formatCurrencyBRL(subtotalCents / 100)} />
              <Row label="Total do pedido" value={formatCurrencyBRL(totalCents / 100)} strong />
              <div className="pt-2 text-xs text-neutral-500">Moeda: <span className="text-neutral-700 dark:text-neutral-300">{order.currency}</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- small components ---------- */

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
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

function PaymentBadge({ status }: { status: string }) {
  const cls =
    status === "PAID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300"
      : status === "PENDING"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300"
      : status === "FAILED" || status === "CANCELLED"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
      : status === "REFUNDED"
      ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-900/20 dark:text-sky-300"
      : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-200";

  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{status}</span>;
}
