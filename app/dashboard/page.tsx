import prisma from "@/lib/prisma";
import Link from "next/link";

/**
 * IMPORTANTE:
 * - A autenticação já foi garantida pelo layout
 * - Aqui cuidamos apenas de dados e UI
 */
export default async function DashboardPage() {
  /**
   * OBS:
   * Neste estágio, buscamos o usuário pelo relacionamento indireto:
   * orders → user
   *
   * Em breve isso pode ser refinado passando o userId pelo layout/context.
   */

  // Buscar usuário mais recente com pedidos
  const user = await prisma.user.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!user) {
    return (
      <p className="text-sm text-neutral-500">
        Nenhum usuário encontrado.
      </p>
    );
  }

  const [
    totalOrders,
    paidOrders,
    totalSpent,
    lastOrder,
  ] = await Promise.all([
    prisma.order.count({
      where: { userId: user.id },
    }),

    prisma.order.count({
      where: {
        userId: user.id,
        status: "PAID",
      },
    }),

    prisma.order.aggregate({
      where: {
        userId: user.id,
        status: "PAID",
      },
      _sum: {
        totalCents: true,
      },
    }),

    prisma.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
        <p className="text-neutral-500">
          Visão geral da sua conta
        </p>
      </header>

      {/* Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Total de pedidos"
          value={totalOrders}
        />

        <DashboardCard
          label="Pedidos pagos"
          value={paidOrders}
        />

        <DashboardCard
          label="Total gasto"
          value={
            totalSpent._sum.totalCents
              ? `R$ ${(totalSpent._sum.totalCents / 100).toFixed(2)}`
              : "R$ 0,00"
          }
        />

        <DashboardCard
          label="Último pedido"
          value={
            lastOrder
              ? `#${lastOrder.id.slice(0, 8)}`
              : "—"
          }
        />
      </section>

      {/* Último pedido */}
      {lastOrder && (
        <section className="p-4 rounded-lg border bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-2">
            Último pedido
          </h2>

          <div className="flex justify-between text-sm">
            <span>
              Pedido #{lastOrder.id.slice(0, 8)}
            </span>
            <span className="text-neutral-500">
              {lastOrder.status}
            </span>
          </div>

          <p className="text-sm mt-2">
            Total: R$ {(lastOrder.totalCents / 100).toFixed(2)}
          </p>

          <p className="text-xs text-neutral-500">
            Criado em{" "}
            {lastOrder.createdAt.toLocaleDateString("pt-BR")}
          </p>
        </section>
      )}

      {/* Ações rápidas */}
      <section className="flex flex-wrap gap-4">
        <Link
          href="/dashboard/orders"
          className="px-4 py-2 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Ver pedidos
        </Link>

        <Link
          href="/dashboard/payments"
          className="px-4 py-2 rounded-md border hover:bg-neutral-50"
        >
          Pagamentos
        </Link>

        <Link
          href="/products"
          className="px-4 py-2 rounded-md border hover:bg-neutral-50"
        >
          Comprar novamente
        </Link>
      </section>
    </div>
  );
}

/* Card reutilizável */
function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-4 rounded-lg border bg-white dark:bg-neutral-900">
      <p className="text-sm text-neutral-500">
        {label}
      </p>
      <p className="text-2xl font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}
