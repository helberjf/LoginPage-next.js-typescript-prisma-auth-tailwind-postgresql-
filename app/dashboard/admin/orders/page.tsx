// app/dashboard/admin/orders/page.tsx
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";

function statusColor(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "PAID":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "PAID":
      return "Pago";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          status: true,
          method: true,
        },
      },
    },
  });

  return (
    <section className="space-y-3 p-2 sm:p-4">
      <h1 className="text-base font-semibold">Pedidos</h1>

      {/* MOBILE – CARDS DENSOS */}
      <div className="grid grid-cols-1 gap-2 md:hidden">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/admin/orders/${order.id}`}
            className="
              block rounded-md border border-gray-200 bg-white
              transition hover:bg-gray-50
              dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800
            "
          >
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {order.user 
                      ? order.user.name 
                      : order.guestFullName || "Visitante"
                    }
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {order.user 
                      ? order.user.email 
                      : order.guestEmail || "Sem email"
                    }
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-[10px] ${statusColor(
                    order.status
                  )}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                  {order.items.length} item(s)
                </span>

                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                  R$ {(order.totalCents / 100).toFixed(2)}
                </span>

                {order.payments.length > 0 && (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {order.payments.length} pagamento(s)
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Criado em {order.createdAt.toLocaleDateString("pt-BR")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* DESKTOP – TABELA COM LINHA CLICÁVEL */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b dark:border-gray-800">
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Itens</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Pagamentos</th>
              <th className="p-2 text-left">Criado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="
                  border-b cursor-pointer
                  hover:bg-gray-50
                  dark:border-gray-800 dark:hover:bg-gray-800
                "
              >
                <td className="p-2 font-medium">
                  <Link
                    href={`/dashboard/admin/orders/${order.id}`}
                    className="block"
                  >
                    <div>
                      <div className="text-sm">
                        {order.user 
                          ? order.user.name 
                          : order.guestFullName || "Visitante"
                        }
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {order.user 
                          ? order.user.email 
                          : order.guestEmail || "Sem email"
                        }
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="p-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] ${statusColor(
                      order.status
                    )}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td className="p-2">
                  {order.items.length}
                </td>
                <td className="p-2">
                  R$ {(order.totalCents / 100).toFixed(2)}
                </td>
                <td className="p-2">
                  {order.payments.length > 0 ? (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {order.payments.length}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-2">
                  {order.createdAt.toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum pedido encontrado.
        </div>
      )}
    </section>
  );
}
