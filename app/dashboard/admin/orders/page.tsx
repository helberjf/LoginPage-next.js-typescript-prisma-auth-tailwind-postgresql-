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
    case "REFUNDED":
      return "Reembolsado";
    default:
      return status;
  }
}

function typeLabel(type?: string) {
  if (type === "SERVICE") return "Serviço";
  if (type === "MIXED") return "Misto";
  return "Produto";
}

type PageProps = {
  searchParams?: Promise<{ status?: string; day?: string; month?: string; kind?: string }>;
};

function normalizeStatus(status?: string): OrderStatus | undefined {
  const v = (status ?? "").toUpperCase().trim();
  if (v === "PENDING" || v === "PAID" || v === "CANCELLED" || v === "REFUNDED") {
    return v as OrderStatus;
  }
  return undefined;
}

function parseDayRange(day?: string) {
  if (!day) return null;
  const start = new Date(`${day}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function parseMonthRange(month?: string) {
  if (!month) return null;
  const [y, m] = month.split("-").map((v) => Number(v));
  if (!y || !m) return null;
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  return { start, end };
}

function normalizeKind(kind?: string): "services" | "products" | undefined {
  const v = (kind ?? "").toLowerCase().trim();
  if (v === "services" || v === "products") return v as "services" | "products";
  return undefined;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const status = normalizeStatus(sp.status);
  const dayRange = parseDayRange(sp.day);
  const monthRange = parseMonthRange(sp.month);
  const dateRange = dayRange ?? monthRange;
  const kind = normalizeKind(sp.kind);

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(kind === "services" ? { schedules: { some: {} } } : {}),
      ...(kind === "products" ? { schedules: { none: {} } } : {}),
      ...(dateRange
        ? { createdAt: { gte: dateRange.start, lt: dateRange.end } }
        : {}),
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      status: true,
      type: true,
      totalCents: true,
      currency: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      guestFullName: true,
      guestEmail: true,
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-base font-semibold">Pedidos</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Filtro: {status ? statusLabel(status) : "Todos"}
          </p>
        </div>
        <Link
          href="/dashboard/admin/orders/new"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          Criar pedido
        </Link>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/dashboard/admin/orders"
            className={status ? "rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300" : "rounded-full border border-gray-900 bg-gray-900 px-3 py-1 text-white dark:border-white dark:bg-white dark:text-gray-900"}
          >
            Todos
          </Link>
          <Link
            href="/dashboard/admin/orders?status=PENDING"
            className={status === "PENDING" ? "rounded-full border border-amber-700 bg-amber-500 px-3 py-1 text-white" : "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300"}
          >
            Pendentes
          </Link>
          <Link
            href="/dashboard/admin/orders?status=PAID"
            className={status === "PAID" ? "rounded-full border border-emerald-700 bg-emerald-600 px-3 py-1 text-white" : "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300"}
          >
            Pagos
          </Link>
          <Link
            href="/dashboard/admin/orders?status=CANCELLED"
            className={status === "CANCELLED" ? "rounded-full border border-red-700 bg-red-600 px-3 py-1 text-white" : "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"}
          >
            Cancelados
          </Link>
          <Link
            href="/dashboard/admin/orders?status=REFUNDED"
            className={status === "REFUNDED" ? "rounded-full border border-sky-700 bg-sky-600 px-3 py-1 text-white" : "rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700 dark:border-sky-900 dark:bg-sky-900/20 dark:text-sky-300"}
          >
            Reembolsados
          </Link>
        </div>
      </div>

      <form className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="day" className="text-gray-500 dark:text-gray-400">Dia</label>
          <input
            id="day"
            name="day"
            type="date"
            defaultValue={sp.day ?? ""}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="month" className="text-gray-500 dark:text-gray-400">Mês</label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={sp.month ?? ""}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="kind" className="text-gray-500 dark:text-gray-400">Tipo</label>
          <select
            id="kind"
            name="kind"
            defaultValue={kind ?? ""}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Todos</option>
            <option value="products">Produtos</option>
            <option value="services">Serviços</option>
          </select>
        </div>
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-gray-900 px-3 py-1 text-white dark:bg-white dark:text-gray-900">
            Aplicar
          </button>
          <Link
            href={`/dashboard/admin/orders${status ? `?status=${status}` : ""}`}
            className="rounded border border-gray-200 px-3 py-1 text-gray-600 dark:border-gray-800 dark:text-gray-300"
          >
            Limpar datas
          </Link>
        </div>
      </form>

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
                  {typeLabel(order.type)}
                </span>
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
              <th className="p-2 text-left">Tipo</th>
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
                  {typeLabel(order.type)}
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
