import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type PageProps = {
  searchParams?:
    | Promise<{
        orderId?: string;
        paymentId?: string;
        status?: string;
        merchantOrderId?: string;
      }>
    | {
        orderId?: string;
        paymentId?: string;
        status?: string;
        merchantOrderId?: string;
      };
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const orderId = resolvedSearchParams?.orderId;
  const paymentId = resolvedSearchParams?.paymentId;
  const status = resolvedSearchParams?.status;
  const merchantOrderId = resolvedSearchParams?.merchantOrderId;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-lg mx-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Pedido recebido
          </h1>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Se o pagamento for aprovado no MercadoPago, seu pedido será processado.
        </p>

        {orderId ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-800/30">
            <span className="text-neutral-600 dark:text-neutral-400">OrderId:</span>{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {orderId}
            </span>
          </div>
        ) : null}

        {paymentId || status || merchantOrderId ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-800/30 space-y-1">
            {paymentId ? (
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">PaymentId:</span>{" "}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {paymentId}
                </span>
              </div>
            ) : null}

            {status ? (
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Status:</span>{" "}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {status}
                </span>
              </div>
            ) : null}

            {merchantOrderId ? (
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">MerchantOrderId:</span>{" "}
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {merchantOrderId}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            Voltar para produtos
          </Link>

          {orderId ? (
            <Link
              href={`/dashboard/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
            >
              Ver detalhes do pedido
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
