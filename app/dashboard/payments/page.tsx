import prisma from "@/lib/prisma";
import Link from "next/link";

/**
 * IMPORTANTE:
 * - Autenticação já garantida pelo layout
 * - Página apenas consome dados e renderiza
 */
export default async function PaymentsPage() {
  /**
   * OBS TEMPORÁRIA:
   * Igual às outras páginas, usamos um usuário provisório.
   * No próximo passo isso será substituído por userId vindo do layout/context.
   */

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

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        userId: user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      order: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-neutral-500">
          Histórico de pagamentos da sua conta
        </p>
      </header>

      {/* Lista */}
      {payments.length === 0 ? (
        <div className="border rounded-md p-6 bg-white dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">
            Nenhum pagamento encontrado.
          </p>

          <Link
            href="/dashboard/orders"
            className="inline-block mt-4 text-sm font-medium text-green-600 hover:underline"
          >
            Ver pedidos →
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="border rounded-lg p-4 bg-white dark:bg-neutral-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Pagamento #{payment.id.slice(0, 8)}
                </span>

                <PaymentStatus status={payment.status} />
              </div>

              {/* Meta */}
              <div className="text-sm text-neutral-500 mt-1">
                {payment.createdAt.toLocaleDateString("pt-BR")}
              </div>

              {/* Info */}
              <div className="mt-3 text-sm space-y-1">
                <p>
                  Valor:{" "}
                  <span className="font-medium">
                    R$ {(payment.amountCents / 100).toFixed(2)}
                  </span>
                </p>

                <p>
                  Método:{" "}
                  <span className="capitalize">
                    {payment.method ?? "—"}
                  </span>
                </p>

                <p>
                  Pedido:{" "}
                  <Link
                    href={`/dashboard/orders/${payment.order.id}`}
                    className="text-green-600 hover:underline"
                  >
                    #{payment.order.id.slice(0, 8)}
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Status visual de pagamento */
function PaymentStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-neutral-200 text-neutral-700",
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
