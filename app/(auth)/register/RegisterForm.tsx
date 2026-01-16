// app/(auth)/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type PhoneCountry = "BR" | "US" | "OTHER";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  cpf: string;
  phoneCountry: PhoneCountry;
  phone: string;

  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

function hasSurname(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every(p => p.length >= 2);
}


function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function isValidCPF(cpf: string) {
  const n = onlyDigits(cpf);
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(n[i]) * (10 - i);
  let d1 = (s * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(n[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(n[i]) * (11 - i);
  let d2 = (s * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(n[10]);
}

function toE164(country: PhoneCountry, digits: string) {
  if (digits.length < 7) {
    throw new Error("Telefone deve ter no mínimo 7 dígitos.");
  }

  if (country === "BR") return `+55${digits}`;
  if (country === "US") return `+1${digits}`;
  return `+${digits}`;
}

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
    birthDate: "",
    gender: "MALE",
    cpf: "",
    phoneCountry: "BR",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const cepDigits = onlyDigits(form.zipCode);
  const cepReady = cepDigits.length === 8 && !cepError;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function fetchCep() {
    if (cepDigits.length !== 8) return;

    setCepLoading(true);
    setCepError(null);

    try {
      const res = await fetch(`/api/cep?cep=${cepDigits}`);
      if (!res.ok) {
        setCepError("CEP não encontrado");
        return;
      }

      const data = await res.json();

      setForm(p => ({
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cepReady) {
      setError("Informe um CEP válido.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.cpf && !isValidCPF(form.cpf)) {
      setError("CPF inválido.");
      return;
    }

    const phoneDigits = onlyDigits(form.phone);

    if (phoneDigits.length < 7) {
      setError("Telefone deve ter no mínimo 7 dígitos.");
      return;
    }

    let phoneE164: string;
    try {
      phoneE164 = toE164(form.phoneCountry, phoneDigits);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirm: form.confirm,
          birthDate: form.birthDate,
          gender: form.gender,
          cpf: form.cpf || undefined,
          phoneCountry: form.phoneCountry,
          phone: phoneE164,
          address: {
            zipCode: cepDigits,
            street: form.street,
            number: form.number,
            complement: form.complement || undefined,
            district: form.district,
            city: form.city,
            state: form.state,
            country: "BR",
          },
        }),
      });

      if (res.status === 201) {
        window.location.href = "/login";
        return;
      }

      const json = await res.json().catch(() => null);
      setError(json?.error ?? "Erro ao registrar.");
    } catch {
      setError("Erro ao registrar.");
    } finally {
      setLoading(false);
    }
  }

  const base =
    "w-full rounded-md border px-2 py-1 text-[12px]";
  const input =
    `${base} border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950`;
  const readonly =
    `${input} bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed`;
  const label = "text-[10px] text-neutral-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {/* NOME */}
      <div className="space-y-[1px]">
        <span className={label}>Nome completo</span>
        <input
          name="name"
          placeholder="Maria da Silva"
          value={form.name}
          onChange={handleChange}
          className={input}
          required
        />
      </div>

      {/* EMAIL */}
      <div className="space-y-[1px]">
        <span className={label}>Email</span>
        <input
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={form.email}
          onChange={handleChange}
          className={input}
          required
        />
      </div>

      {/* CPF + GÊNERO */}
      <div className="grid grid-cols-2 gap-1">
        <div className="space-y-[1px]">
          <span className={label}>CPF</span>
          <input
            name="cpf"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={handleChange}
            className={input}
          />
        </div>

        <div className="space-y-[1px]">
          <span className={label}>Gênero</span>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className={input}
          >
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Feminino</option>
            <option value="OTHER">Outro</option>
          </select>
        </div>
      </div>

      {/* TELEFONE */}
      <div className="grid grid-cols-[64px_1fr] gap-1">
        <div className="space-y-[1px]">
          <span className={label}>País</span>
          <select
            name="phoneCountry"
            value={form.phoneCountry}
            onChange={handleChange}
            className={input}
          >
            <option value="BR">BR</option>
            <option value="US">US</option>
            <option value="OTHER">OUT</option>
          </select>
        </div>

        <div className="space-y-[1px]">
          <span className={label}>Telefone</span>
          <div className="flex">
            {(form.phoneCountry === "BR" || form.phoneCountry === "US") && (
              <span className="px-2 py-1 text-[12px] border border-r-0 rounded-l-md bg-neutral-100 dark:bg-neutral-900 text-neutral-600">
                {form.phoneCountry === "BR" ? "+55" : "+1"}
              </span>
            )}

            <input
              name="phone"
              placeholder={
                form.phoneCountry === "OTHER"
                  ? "+351912345678"
                  : "Somente números"
              }
              value={form.phone}
              onChange={handleChange}
              className={`${input} ${
                form.phoneCountry !== "OTHER" ? "rounded-l-none" : ""
              }`}
              required
            />
          </div>
        </div>
      </div>

      {/* NASCIMENTO */}
      <div className="space-y-[1px]">
        <span className={label}>Data de nascimento</span>
        <input
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={handleChange}
          className={input}
          required
        />
      </div>

      {/* CEP */}
      <div className="space-y-[1px]">
        <span className={label}>CEP</span>
        <input
          name="zipCode"
          placeholder="00000-000"
          value={form.zipCode}
          onChange={handleChange}
          onBlur={fetchCep}
          className={input}
          required
        />

        {cepLoading && (
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
            Buscando CEP…
          </div>
        )}

        {cepError && (
          <p className="text-[10px] text-red-600">{cepError}</p>
        )}
      </div>

      {/* ENDEREÇO */}
      {cepReady && (
        <>
          <div className="space-y-[1px]">
            <span className={label}>Rua</span>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              className={input}
              required
            />
          </div>

          <div className="space-y-[1px]">
            <span className={label}>Bairro</span>
            <input value={form.district} readOnly className={readonly} />
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="space-y-[1px]">
              <span className={label}>Cidade</span>
              <input value={form.city} readOnly className={readonly} />
            </div>
            <div className="space-y-[1px]">
              <span className={label}>UF</span>
              <input value={form.state} readOnly className={readonly} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div className="space-y-[1px]">
              <span className={label}>Número</span>
              <input
                name="number"
                placeholder="123"
                value={form.number}
                onChange={handleChange}
                className={input}
                required
              />
            </div>
            <div className="space-y-[1px]">
              <span className={label}>Complemento</span>
              <input
                name="complement"
                placeholder="Apto, casa"
                value={form.complement}
                onChange={handleChange}
                className={input}
              />
            </div>
          </div>
        </>
      )}

      {/* SENHA */}
      <div className="space-y-[1px]">
        <span className={label}>Senha</span>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          className={input}
          required
        />
      </div>

      <div className="space-y-[1px]">
        <span className={label}>Confirmar senha</span>
        <input
          name="confirm"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={handleChange}
          className={input}
          required
        />
      </div>

      {error && (
        <p className="text-[10px] text-red-600">{error}</p>
      )}

      {/* CTA */}
      <div className="mt-2 space-y-1">
        <button
          disabled={loading || !cepReady}
          className="w-full rounded-md bg-blue-600 text-white py-1.5 text-sm disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-[10px] text-center">
          Já tem conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </form>
  );
}
