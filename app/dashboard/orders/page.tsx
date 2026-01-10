import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const orders = await prisma.order.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Meus pedidos</h1>
        <p className="text-sm text-neutral-500">
          Histórico de compras realizadas
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Você ainda não realizou nenhum pedido.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border rounded-lg bg-white dark:bg-neutral-900 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Pedido #{order.id.slice(0, 8)}
                </span>
                <span className="text-sm text-neutral-500">
                  {order.status}
                </span>
              </div>

              <div className="text-sm text-neutral-600">
                Total:{" "}
                <strong>
                  R$ {(order.totalCents / 100).toFixed(2)}
                </strong>
              </div>

              <div className="text-xs text-neutral-500">
                Criado em{" "}
                {order.createdAt.toLocaleDateString("pt-BR")}
              </div>

              <ul className="text-sm list-disc pl-5">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
