// app/checkout/payment/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { validateCpf } from "@/lib/validators/validateCpf";
import { formatCpf, formatPhoneBR, onlyDigits } from "@/lib/utils/formatters";

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
  orderId?: string;
};

type CepResponse = {
  street: string;
  district: string;
  city: string;
  state: string;
};

function hasSurname(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

function CheckoutPaymentContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const productId = searchParams.get("productId");
  const forceBuyerInfo = Boolean(productId);
  const [profileLoaded, setProfileLoaded] = useState(false);

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

  const formValid = session && !forceBuyerInfo
    ? true
    : hasSurname(form.name) &&
      form.email.trim().length > 3 &&
      validateCpf(form.cpf) &&
      onlyDigits(form.phone).length >= 10 &&
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
    if (items.length === 0 && !productId) {
      router.replace("/checkout");
    }
  }, [items, router, productId]);

  useEffect(() => {
    if (!forceBuyerInfo || !session?.user) return;
    if (!profileLoaded) {
      (async () => {
        try {
          const res = await fetch("/api/me");
          if (!res.ok) return;
          const data = await res.json();
          const user = data?.user;
          const address = user?.addresses?.[0];

          const rawPhone = String(user?.profile?.phone ?? "");
          let phoneDigits = onlyDigits(rawPhone);
          if (phoneDigits.startsWith("55") && phoneDigits.length > 11) {
            phoneDigits = phoneDigits.slice(2);
          }

          setForm((prev) => ({
            ...prev,
            name: prev.name || user?.name || session.user?.name || "",
            email: prev.email || user?.email || session.user?.email || "",
            cpf: prev.cpf || formatCpf(String(user?.profile?.cpf ?? "")),
            phone: prev.phone || formatPhoneBR(phoneDigits),
            zipCode: prev.zipCode || String(address?.zipCode ?? ""),
            street: prev.street || String(address?.street ?? ""),
            number: prev.number || String(address?.number ?? ""),
            complement: prev.complement || String(address?.complement ?? ""),
            district: prev.district || String(address?.district ?? ""),
            city: prev.city || String(address?.city ?? ""),
            state: prev.state || String(address?.state ?? ""),
          }));
        } finally {
          setProfileLoaded(true);
        }
      })();
    }
  }, [forceBuyerInfo, session, profileLoaded]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => {
      if (name === "cpf") {
        return { ...p, cpf: formatCpf(value) };
      }

      if (name === "phone") {
        return { ...p, phone: formatPhoneBR(value) };
      }

      return { ...p, [name]: value };
    });
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

      const data = await res.json() as CepResponse;

      setForm((p) => ({
        ...p,
        street: data.street,
        district: data.district,
        city: data.city,
        state: data.state,
      }));
    } catch (fetchError) {
      console.error("CEP fetch error:", fetchError);
      setCepError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }

  async function startCheckout(payload: Record<string, unknown>) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as CheckoutResponse;

    if (!res.ok || !data.redirectUrl) {
      throw new Error(data.error ?? "Erro ao iniciar pagamento");
    }

    clearCart();
    window.location.href = data.redirectUrl;
  }

  async function handleLoggedCheckout() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await startCheckout(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar pagamento");
      setLoading(false);
    }
  }

  async function handleGuestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);

    if (!formValid) {
      setError("Por favor, preencha todos os campos obrigatórios corretamente");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        guest: {
          name: form.name,
          email: form.email,
          cpf: onlyDigits(form.cpf),
          phone: onlyDigits(form.phone),
          address: {
            street: form.street,
            number: form.number,
            complement: form.complement || null,
            district: form.district,
            city: form.city,
            state: form.state,
            zipCode: zipDigits,
            country: "BR",
          },
        },
      };

      await startCheckout(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar pagamento");
      setLoading(false);
    }
  }

  const base = "w-full rounded-md border px-3 py-2 text-sm transition";
  const input = `${base} border-neutral-300 dark:border-neutral-700 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 disabled:opacity-60 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900`;
  const readonly = `${input} bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed`;
  const label = "text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1 block";

  if (items.length === 0 && !productId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao carrinho
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Finalizar compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Pagamento seguro via MercadoPago
              </div>

              {session && !forceBuyerInfo ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Você está logado como <strong>{session.user?.email}</strong>. O pagamento será processado usando os dados do seu perfil.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleLoggedCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Processando..." : "Pagar com MercadoPago"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="name">
                        Nome completo *
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={input}
                        placeholder="Ex: João Silva"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={label} htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className={input}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="cpf">
                        CPF *
                      </label>
                      <input
                        id="cpf"
                        name="cpf"
                        value={form.cpf}
                        onChange={handleChange}
                        className={input}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>

                    <div>
                      <label className={label} htmlFor="phone">
                        Telefone *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={input}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="zipCode">
                        CEP *
                      </label>
                      <input
                        id="zipCode"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleChange}
                        onBlur={fetchCep}
                        className={input}
                        placeholder="00000-000"
                        required
                      />

                      {cepLoading && (
                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                          Buscando CEP...
                        </div>
                      )}

                      {cepError && (
                        <p className="text-xs text-red-500 mt-1">{cepError}</p>
                      )}
                    </div>

                    <div>
                      <label className={label} htmlFor="number">
                        Número *
                      </label>
                      <input
                        id="number"
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        className={input}
                        placeholder="123"
                        required
                        disabled={!cepReady}
                      />
                    </div>
                  </div>

                  {cepReady && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={label}>Rua</label>
                        <input value={form.street} readOnly className={readonly} />
                      </div>

                      <div>
                        <label className={label}>Bairro</label>
                        <input value={form.district} readOnly className={readonly} />
                      </div>

                      <div>
                        <label className={label}>Cidade</label>
                        <input value={form.city} readOnly className={readonly} />
                      </div>

                      <div>
                        <label className={label}>UF</label>
                        <input value={form.state} readOnly className={readonly} />
                      </div>

                      <div className="sm:col-span-2">
                        <label className={label} htmlFor="complement">
                          Complemento (opcional)
                        </label>
                        <input
                          id="complement"
                          name="complement"
                          value={form.complement}
                          onChange={handleChange}
                          className={input}
                          placeholder="Apto 101, Bloco A"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !formValid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Processando..." : "Pagar com MercadoPago"}
                  </button>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    * Campos obrigatórios
                  </p>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-6 space-y-4 sticky top-4">
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image ?? "/images/placeholder/iphone17ProMax.webp"}
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

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />}> 
      <CheckoutPaymentContent />
    </Suspense>
  );
}