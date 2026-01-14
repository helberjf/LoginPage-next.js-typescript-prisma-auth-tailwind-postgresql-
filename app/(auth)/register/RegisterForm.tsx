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
};

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
  if (country === "BR") return `+55${digits}`;
  if (country === "US") return `+1${digits}`;
  if (digits.length < 8) throw new Error("Telefone inválido");
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
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.cpf && !isValidCPF(form.cpf)) {
      setError("CPF inválido.");
      return;
    }

    const phoneDigits = onlyDigits(form.phone);

    if (form.phoneCountry === "BR" && phoneDigits.length !== 11) {
      setError("Telefone BR deve ter 11 números (DDD + número).");
      return;
    }

    if (form.phoneCountry === "US" && phoneDigits.length !== 10) {
      setError("Telefone US deve ter 10 números.");
      return;
    }

    const phoneE164 = toE164(form.phoneCountry, phoneDigits);

    if (!/^\+\d{8,15}$/.test(phoneE164)) {
      setError("Telefone inválido.");
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
          phone: phoneE164,
          phoneCountry: form.phoneCountry,
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

  const baseInput =
    "w-full rounded-md border px-2.5 py-1 md:py-1.5 text-sm bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 md:space-y-2">
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Nome completo</label>
        <input name="name" value={form.name} onChange={handleChange} required className={baseInput} />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required className={baseInput} />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">CPF</label>
        <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" className={baseInput} />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Telefone</label>
        <div className="flex gap-2">
          <select name="phoneCountry" value={form.phoneCountry} onChange={handleChange} className="w-28 rounded-md border px-2 py-1 md:py-1.5 text-sm bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700">
            <option value="BR">BR +55</option>
            <option value="US">US +1</option>
            <option value="OTHER">Outro</option>
          </select>
          <input name="phone" value={form.phone} onChange={handleChange} required inputMode="numeric" className={baseInput} />
        </div>
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Nascimento</label>
        <input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required className={baseInput} />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Gênero</label>
        <select name="gender" value={form.gender} onChange={handleChange} className={baseInput}>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Feminino</option>
          <option value="OTHER">Outro</option>
        </select>
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Senha</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required className={baseInput} />
      </div>
      <div className="space-y-0.5">
        <label className="block text-[11px] md:text-xs font-medium">Confirmar senha</label>
        <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required className={baseInput} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 text-white text-sm py-1 md:py-1.5 hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Criando..." : "Criar conta"}
      </button>
      <p className="text-[11px] text-center">
        Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Entrar</Link>
      </p>
    </form>
  );
}
