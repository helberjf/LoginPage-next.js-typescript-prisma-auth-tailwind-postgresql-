import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar Pedido | Apple Store",
  description: "Encontre seu pedido usando e-mail ou código de compra.",
};

export default function OrderSearchPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-3xl font-bold">Ver pedido</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Informe o e-mail utilizado na compra ou o código do pedido para localizar sua compra.
        </p>
        <form className="space-y-3">
          <input
            type="text"
            name="query"
            placeholder="E-mail ou código do pedido"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>
      </div>
    </main>
  );
}