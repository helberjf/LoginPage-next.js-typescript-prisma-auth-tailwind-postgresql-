// app\(auth)\register\RegisterForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (form.password !== form.confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.status === 201) {
        window.location.href = "/login";
        return;
      }

      const json = await res.json().catch(() => null);
      setError(json?.error ?? "Erro ao registrar.");
    } catch (err) {
      console.error(err);
      setError("Erro ao registrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="space-y-1">
        <label className="block text-sm font-medium">Primeiro nome</label>
        <input
          name="firstName"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          placeholder="Seu nome"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Senha</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          placeholder="••••••••"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Confirmar senha</label>
        <input
          name="confirm"
          type="password"
          value={form.confirm}
          onChange={handleChange}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 text-white text-sm py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-xs text-center mt-1">
        Já tem conta?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
