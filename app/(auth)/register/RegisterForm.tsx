"use client";

import { useState } from "react";
import Link from "next/link";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  birthDate: string;
  gender: "MALE" | "FEMALE" | "OTHER";
};

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
    birthDate: "",
    gender: "MALE", // ✅ padrão é MALE
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
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
          birthDate: form.birthDate || null,
          gender: form.gender,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Nome */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium">Nome completo</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="
            w-full rounded-md border px-2.5 py-1.5 text-sm
            bg-white text-neutral-900
            dark:bg-neutral-950 dark:text-neutral-100
            border-neutral-300 dark:border-neutral-700
          "
        />
      </div>

      {/* Email */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="
            w-full rounded-md border px-2.5 py-1.5 text-sm
            bg-white text-neutral-900
            dark:bg-neutral-950 dark:text-neutral-100
            border-neutral-300 dark:border-neutral-700
          "
        />
      </div>

      {/* Data de nascimento */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium">Nascimento</label>
        <input
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={handleChange}
          className="
            w-full rounded-md border px-2.5 py-1.5 text-sm
            bg-white text-neutral-900
            dark:bg-neutral-950 dark:text-neutral-100
            border-neutral-300 dark:border-neutral-700
          "
        />
      </div>

      {/* Gênero */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium">Gênero</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="
            w-full rounded-md border px-2.5 py-1.5 text-sm
            bg-white text-neutral-900
            dark:bg-neutral-950 dark:text-neutral-100
            border-neutral-300 dark:border-neutral-700
          "
        >
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Feminino</option>
          <option value="OTHER">Outro</option>
        </select>
      </div>

      {/* Senha */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium">Senha</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className="
            w-full rounded-md border px-2.5 py-1.5 text-sm
            bg-white text-neutral-900
            dark:bg-neutral-950 dark:text-neutral-100
            border-neutral-300 dark:border-neutral-700
          "
        />
      </div>

      {/* Confirmar senha */}
      <div className="space-y-0.5">
        <label className="block text-xs font-medium">Confirmar senha</label>
        <input
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          required
          className="
            w-full rounded-md border px-2.5 py-1.5 text-sm
            bg-white text-neutral-900
            dark:bg-neutral-950 dark:text-neutral-100
            border-neutral-300 dark:border-neutral-700
          "
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-md bg-blue-600 text-white
          text-sm py-1.5 hover:bg-blue-700
          disabled:opacity-50
        "
      >
        {loading ? "Criando..." : "Criar conta"}
      </button>

      <p className="text-[11px] text-center">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
