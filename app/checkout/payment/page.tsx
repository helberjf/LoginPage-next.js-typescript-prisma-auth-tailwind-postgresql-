"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { validateCpf } from "@/lib/validators/validateCpf";

type FormState = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

type CheckoutResponse = {
  redirectUrl?: string;
  error?: string;
};

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function hasSurname(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

export default function CheckoutPaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });

  const zipDigits = onlyDigits(form.zipCode);

  const cepReady = zipDigits.length === 8 && !cepError;

  const formValid = session
    ? true // Logged users don't need form validation here (they should have data in profile)
    : hasSurname(form.name) &&
      form.email.trim().length > 3 &&
      validateCpf(form.cpf) &&
      onlyDigits(form.phone).length >= 7 &&
      cepReady &&
      form.street.trim().length > 0 &&
      form.district.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.state.trim().length > 0 &&
      form.number.trim().length > 0;

  const totalCents = items.reduce(
    (sum, item) =>
      sum +
      (item.discountPercent && item.discountPercent > 0
        ? Math.round(item.priceCents * (1 - item.discountPercent / 100))
        : item.priceCents) *
        item.quantity,
    0
  );

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/checkout");
    }
  }, [items, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function fetchCep() {
    if (zipDigits.length !== 8) return;

    setCepLoading(true);
    setCepError(null);

    try {
      const res = await fetch(`/api/cep?cep=${zipDigits}`);
      if (!res.ok) {
        setCepError("CEP não encontrado");
        return;
      }

      const data = (await res.json()) as {
        street: string;
        district: string;
        city: string;
        state: string;
      };

      setForm((p) => ({
        ...p,
        street: data.street,
        district: data.district,
        city: data.city,
        state: data.state,
      }));
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  async function startCheckout(payload: unknown) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as CheckoutResponse;

    if (!res.ok || !data.redirectUrl) {
      throw new Error(data.error ?? "Erro ao iniciar pagamento");
    }

    // Clear cart after successful checkout initiation
    clearCart();
    window.location.href = data.redirectUrl;
  }

  async function handleLoggedCheckout() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await startCheckout({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar pagamento");
      setLoading(false);
    }
  }

  async function handleGuestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);

    if (!formValid) return;

    setLoading(true);

    try {
      await startCheckout({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        guest: {
          name: form.name,
          email: form.email,
          cpf: form.cpf,
          phone: form.phone,
          address: {
            street: form.street,
            number: form.number,
            complement: form.complement ? form.complement : null,
            district: form.district,
            city: form.city,
            state: form.state,
            zipCode: zipDigits,
            country: "BR",
          },
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar pagamento");
      setLoading(false);
    }
  }

  const base = "w-full rounded-md border px-2.5 py-1.5 text-sm";
  const input = `${base} border-neutral-300 dark:border-neutral-700 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 disabled:opacity-60`;
  const readonly = `${input} bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed`;
  const label = "text-xs font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao carrinho
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Finalizar compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Pagamento seguro via MercadoPago
              </div>

              {session ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Você está logado como <strong>{session.user?.email}</strong>. O pagamento será processado usando os dados do seu perfil.
                    </p>
                  </div>

                  {error ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleLoggedCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
                  >
                    {loading ? "Processando..." : "Pagar com MercadoPago"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className={label} htmlFor="name">
                        Nome completo
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={input}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={label} htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={input}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className={label} htmlFor="cpf">
                        CPF
                      </label>
                      <input
                        id="cpf"
                        name="cpf"
                        value={form.cpf}
                        onChange={handleChange}
                        className={input}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={label} htmlFor="phone">
                        Telefone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={input}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className={label} htmlFor="zipCode">
                        CEP
                      </label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleChange}
                        onBlur={fetchCep}
                        className={input}
                        required
                      />

                      {cepLoading ? (
                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                          Buscando CEP...
                        </div>
                      ) : null}

                      {cepError ? (
                        <p className="text-xs text-red-500">{cepError}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <label className={label} htmlFor="number">
                        Número
                      </label>
                      <input
                        id="number"
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        className={input}
                        required
                        disabled={!cepReady}
                      />
                    </div>
                  </div>

                  {cepReady ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className={label}>Rua</label>
                        <input value={form.street} readOnly className={readonly} />
                      </div>

                      <div className="space-y-1">
                        <label className={label}>Bairro</label>
                        <input value={form.district} readOnly className={readonly} />
                      </div>

                      <div className="space-y-1">
                        <label className={label}>Cidade</label>
                        <input value={form.city} readOnly className={readonly} />
                      </div>

                      <div className="space-y-1">
                        <label className={label}>UF</label>
                        <input value={form.state} readOnly className={readonly} />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className={label} htmlFor="complement">
                          Complemento
                        </label>
                        <input
                          id="complement"
                          name="complement"
                          value={form.complement}
                          onChange={handleChange}
                          className={input}
                        />
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading || !formValid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
                  >
                    {loading ? "Processando..." : "Pagar com MercadoPago"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4 sticky top-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Resumo do pedido
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const finalPrice =
                    item.discountPercent && item.discountPercent > 0
                      ? Math.round(item.priceCents * (1 - item.discountPercent / 100))
                      : item.priceCents;

                  return (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <img
                        src={item.image ?? "/placeholder.png"}
                        alt={item.name}
                        className="w-12 h-12 object-contain bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {item.name}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {item.quantity}x R$ {(finalPrice / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        R$ {((finalPrice * item.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    R$ {(totalCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Frete</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Grátis
                  </span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      R$ {(totalCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
