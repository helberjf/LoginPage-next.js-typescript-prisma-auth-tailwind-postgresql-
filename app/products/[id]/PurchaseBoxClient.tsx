"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Calendar, ChevronDown } from "lucide-react";
import { validateCpf } from "@/lib/validators/validateCpf";

type Props = {
  productId: string;
  isLogged: boolean;
  isServiceSchedule: boolean;
};

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

type CepResponse = {
  street: string;
  district: string;
  city: string;
  state: string;
};

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function hasSurname(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

export default function PurchaseBoxClient({ productId, isLogged, isServiceSchedule }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Form para compra normal
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

  const cepReady = useMemo(() => {
    return zipDigits.length === 8 && !cepError;
  }, [zipDigits.length, cepError]);

  const formValid = useMemo(() => {
    if (isLogged) return true;

    const nameValid = hasSurname(form.name);
    const emailValid = form.email.trim().length > 3;
    const cpfValid = validateCpf(form.cpf);
    const phoneValid = onlyDigits(form.phone).length >= 7;

    const addressValid =
      form.street.trim().length > 0 &&
      form.district.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.state.trim().length > 0;

    return (
      nameValid &&
      emailValid &&
      cpfValid &&
      phoneValid &&
      cepReady &&
      addressValid &&
      form.number.trim().length > 0
    );
  }, [isLogged, form, cepReady]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

    window.location.href = data.redirectUrl;
  }

  async function handleLoggedCheckout() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await startCheckout({ items: [{ productId, quantity: 1 }] });
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
        items: [{ productId, quantity: 1 }],
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

  // Funções de agendamento removidas - fluxo integrado com SchedulingFlow component
  // O agendamento é feito via /schedules page com componente SchedulingFlow

  const base = "w-full rounded-md border px-2 py-1.5 text-xs sm:text-sm";
  const input = `${base} border-neutral-300 dark:border-neutral-700 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 disabled:opacity-60`;
  const readonly = `${input} bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed`;
  const label = "text-[10px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300";

  // Se for serviço/agendamento, mostra botões para agendar e consultar serviços
  if (isServiceSchedule) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-green-600" />
          <h3 className="text-sm sm:text-base font-semibold text-green-900 dark:text-green-100">
            Agende seu serviço
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 mb-4">
          Escolha uma das opções abaixo para prosseguir com seu agendamento.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = "/schedules"}
            className="w-full rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition flex items-center justify-center gap-2"
            aria-label="Ir para agendamentos"
          >
            <Calendar className="h-4 w-4" />
            Agendar Agora
          </button>

          <button
            onClick={() => window.location.href = "/checkout/payment?productId=" + productId}
            className="w-full rounded-lg border-2 border-green-600 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 px-4 py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2"
            aria-label="Ir para checkout de pagamento"
          >
            <ShieldCheck className="h-4 w-4" />
            Pagar para Agendar
          </button>

          <button
            onClick={() => window.location.href = "/schedules"}
            className="w-full rounded-lg border border-green-600 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2"
            aria-label="Consultar serviços"
          >
            <Calendar className="h-4 w-4" />
            Consultar Serviços
          </button>
        </div>

        <p className="text-[10px] sm:text-xs text-green-700 dark:text-green-300 mt-3 text-center">
          Agendamento rápido e seguro
        </p>
      </div>
    );
  }

  // Formulário normal de compra
  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Botão de compra rápida */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => window.location.href = "/checkout/payment?productId=" + productId}
          className="w-full rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition flex items-center justify-center gap-2"
          aria-label="Ir para checkout de pagamento"
        >
          <ShieldCheck className="h-4 w-4" />
          Comprar Agora
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left"
        aria-expanded={isExpanded}
        aria-label="Expandir opções de compra"
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Compre com segurança pelo MercadoPago
        </div>
        <ChevronDown className={`h-4 w-4 text-neutral-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          {isLogged ? (
            <div className="space-y-2">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={handleLoggedCheckout}
                className="w-full rounded-md bg-green-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Redirecionando..." : "Pagar via MercadoPago"}
              </button>

              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                Você precisa ter CPF válido cadastrado no seu perfil.
              </p>
            </div>
          ) : (
            <form onSubmit={handleGuestSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label className={label} htmlFor="name">
                    Nome completo
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

                <div className="space-y-1 sm:col-span-2">
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
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                    placeholder="000.000.000-00"
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
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                    placeholder="00000-000"
                    required
                  />

                  {cepLoading && (
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                      Buscando...
                    </div>
                  )}

                  {cepError && (
                    <p className="text-[10px] text-red-500">{cepError}</p>
                  )}
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
                    placeholder="123"
                    required
                    disabled={!cepReady}
                  />
                </div>
              </div>

              {cepReady && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1 col-span-2">
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

                  <div className="space-y-1">
                    <label className={label} htmlFor="complement">
                      Complemento
                    </label>
                    <input
                      id="complement"
                      name="complement"
                      value={form.complement}
                      onChange={handleChange}
                      className={input}
                      placeholder="Apto 101"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formValid}
                className="w-full rounded-md bg-green-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Redirecionando..." : "Pagar via MercadoPago"}
              </button>

              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                Compra sem cadastro: preencha os dados acima.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}