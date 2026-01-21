"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type CheckoutResponse = {
  redirectUrl: string;
  error?: string;
};

export default function GuestCheckoutClient() {
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
      quantity: 1,
      guest: {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        cpf: String(formData.get("cpf")),
        phone: String(formData.get("phone")),
        address: {
          street: String(formData.get("street")),
          number: String(formData.get("number")),
          complement: formData.get("complement")
            ? String(formData.get("complement"))
            : null,
          district: String(formData.get("district")),
          city: String(formData.get("city")),
          state: String(formData.get("state")),
          zipCode: String(formData.get("zipCode")),
          country: formData.get("country") ? String(formData.get("country")) : "BR",
        },
      },
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

      toast.success("Redirecionando para pagamento...", {
        description: "Você será redirecionado para o MercadoPago.",
      });

      window.location.href = data.redirectUrl;
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Erro inesperado ao iniciar o pagamento.";

      setError(errorMessage);
      toast.error("Erro no checkout", {
        description: errorMessage,
      });
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
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-md mx-auto bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 rounded-xl p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dados do comprador</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Informe seus dados para continuar o pagamento
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* inputs */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Nome</label>
            <input name="name" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Email</label>
            <input name="email" type="email" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">CPF</label>
              <input name="cpf" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Telefone</label>
              <input name="phone" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Endereço</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Rua</label>
            <input name="street" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Número</label>
              <input name="number" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Complemento</label>
              <input name="complement" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Bairro</label>
            <input name="district" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Cidade</label>
              <input name="city" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Estado</label>
              <input name="state" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">CEP</label>
              <input name="zipCode" required className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">País</label>
              <input name="country" defaultValue="BR" className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

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
