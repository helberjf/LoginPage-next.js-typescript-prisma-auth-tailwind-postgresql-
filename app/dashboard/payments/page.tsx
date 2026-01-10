import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function PaymentsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        user: {
          email: session.user.email,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      order: true,
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-sm text-neutral-500">
          Histórico de pagamentos realizados
        </p>
      </header>

      {payments.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum pagamento encontrado.
        </p>
      ) : (
        <ul className="space-y-4">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="border rounded-lg bg-white dark:bg-neutral-900 p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Pedido #{payment.orderId.slice(0, 8)}
                </span>

                <span className="text-sm text-neutral-500">
                  {payment.status}
                </span>
              </div>

              <div className="text-sm">
                Valor:{" "}
                <strong>
                  R$ {(payment.amountCents / 100).toFixed(2)}
                </strong>
              </div>

              <div className="text-xs text-neutral-500">
                Pago em{" "}
                {payment.createdAt.toLocaleDateString("pt-BR")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
