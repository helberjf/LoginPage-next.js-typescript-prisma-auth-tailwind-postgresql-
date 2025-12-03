// src/app/(auth)/login/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type LoginFormState = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.set("action", "signin");
      body.set("provider", "credentials");
      body.set("email", form.email);
      body.set("password", form.password);

      const res = await fetch("/api/auth", {
        method: "POST",
        body,
        redirect: "manual",
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location") ?? "/dashboard";
        window.location.href = location;
        return;
      }

      if (!res.ok) {
        setError("Email ou senha inválidos.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    window.location.href =
      "/api/auth/signin/google?callbackUrl=/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="seu@email.com"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Senha
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 text-white text-sm py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 text-sm py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        Entrar com Google
      </button>

      <div className="flex justify-between text-xs mt-1">
        <Link
          href="/forgot-password"
          className="text-blue-600 hover:underline"
        >
          Esqueci minha senha
        </Link>
        <Link
          href="/register"
          className="text-blue-600 hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </form>
  );
}
