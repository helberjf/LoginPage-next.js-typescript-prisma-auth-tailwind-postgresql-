import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Package } from "lucide-react";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDateBR(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(date);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const orderId = resolvedParams?.id;

  if (!orderId) {
    return { title: "Pedido não encontrado" };
  }

  return {
    title: `Pedido #${orderId.slice(0, 8)} | Minha Conta`,
    description: "Detalhes do seu pedido.",
  };
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await Promise.resolve(params);
  const orderId = resolvedParams?.id;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deletedAt: null,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          priceCents: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const subtotalCents = order.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="mx-auto max-w-5xl space-y-6 px-3 py-6 sm:px-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Pedido</h1>
              <span className="text-sm text-neutral-500">#{order.id.slice(0, 8)}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Criado em {formatDateBR(order.createdAt)}</p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium shadow-sm transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
          >
            Voltar ao dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold">Itens do pedido</h2>

            {order.items.length === 0 ? (
              <div className="flex h-28 items-center justify-center text-sm text-neutral-400">Nenhum item.</div>
            ) : (
              <div className="space-y-2">
                {order.items.map((item) => {
                  const lineTotal = (item.priceCents * item.quantity) / 100;
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-3 py-3 text-sm dark:border-neutral-800">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-neutral-500" />
                          <Link href={`/products/${item.product.id}`} className="font-medium truncate hover:underline">
                            {item.product.name}
                          </Link>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Quantidade: {item.quantity} • Unitário: {formatCurrencyBRL(item.priceCents / 100)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrencyBRL(lineTotal)}</div>
                        <div className="text-xs text-neutral-500">#{item.product.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="mb-3 text-sm font-semibold">Resumo</h2>
              <div className="space-y-2 text-sm">
                <Row label="Subtotal itens" value={formatCurrencyBRL(subtotalCents / 100)} />
                <Row label="Total do pedido" value={formatCurrencyBRL(order.totalCents / 100)} strong />
                <div className="pt-2 text-xs text-neutral-500">
                  Moeda: <span className="text-neutral-700 dark:text-neutral-300">{order.currency}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="mb-3 text-sm font-semibold">Atualização</h2>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Atualizado em <span className="text-neutral-700 dark:text-neutral-300">{formatDateBR(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

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
