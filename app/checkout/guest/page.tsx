"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

type CheckoutResponse = {
  redirectUrl: string;
  error?: string;
};

export default function GuestCheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      productId,
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      cpf: formData.get("cpf") ? String(formData.get("cpf")) : null,
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: CheckoutResponse = await res.json();

      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "Erro ao iniciar pagamento");
      }

      // Redireciona para o Mercado Pago (Checkout Pro)
      window.location.href = data.redirectUrl;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro inesperado ao iniciar o pagamento.");
      }
      setLoading(false);
    }
  }

  if (!productId) {
    return (
      <p className="p-6 text-sm text-red-500">
        Produto inválido.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-md mx-auto bg-white border rounded-xl p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">
            Dados do comprador
          </h1>
          <p className="text-sm text-neutral-500">
            Informe seus dados para continuar o pagamento
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Nome completo
            </label>
            <input
              name="name"
              required
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              CPF (opcional)
            </label>
            <input
              name="cpf"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Telefone (opcional)
            </label>
            <input
              name="phone"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Redirecionando..." : "Ir para pagamento"}
          </button>
        </form>
      </div>
    </main>
  );
}
