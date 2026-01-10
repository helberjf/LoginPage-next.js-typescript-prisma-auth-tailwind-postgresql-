import prisma from "@/lib/prisma";
import Link from "next/link";

/**
 * IMPORTANTE:
 * - A autenticação já foi garantida pelo layout do dashboard
 * - Esta página apenas consome dados e renderiza UI
 */
export default async function OrdersPage() {
  /**
   * NOTA:
   * Assim como no dashboard, aqui estamos assumindo
   * que o usuário já está autenticado.
   *
   * No próximo passo, podemos melhorar isso passando
   * o userId pelo layout/context.
   */

  // Buscar usuário mais recente (provisório, igual ao dashboard)
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!user) {
    return (
      <p className="text-sm text-neutral-500">
        Nenhum usuário encontrado.
      </p>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
      payments: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">Meus pedidos</h1>
        <p className="text-neutral-500">
          Histórico completo das suas compras
        </p>
      </header>

      {/* Lista */}
      {orders.length === 0 ? (
        <div className="border rounded-md p-6 bg-white dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">
            Você ainda não realizou nenhum pedido.
          </p>

          <Link
            href="/products"
            className="inline-block mt-4 text-sm font-medium text-green-600 hover:underline"
          >
            Ver produtos →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border rounded-lg p-4 bg-white dark:bg-neutral-900"
            >
              {/* Header do pedido */}
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Pedido #{order.id.slice(0, 8)}
                </span>

                <OrderStatus status={order.status} />
              </div>

              {/* Meta */}
              <div className="text-sm text-neutral-500 mt-1">
                Criado em{" "}
                {order.createdAt.toLocaleDateString("pt-BR")}
              </div>

              {/* Itens */}
              <ul className="mt-3 text-sm list-disc pl-5">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product.name}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <span className="font-medium">
                  Total: R${" "}
                  {(order.totalCents / 100).toFixed(2)}
                </span>

                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="text-sm text-green-600 hover:underline"
                >
                  Ver detalhes →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Status visual simples e realista */
function OrderStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${
        styles[status] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {status}
    </span>
  );
}
