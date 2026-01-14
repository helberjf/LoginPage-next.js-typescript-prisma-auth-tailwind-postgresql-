// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) {
      setError("Informe um email válido.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError("Erro ao processar solicitação. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md mx-auto space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="text-neutral-500 text-sm">
          Informe seu email para receber o link de redefinição
        </p>
      </header>

      <div className="border rounded-xl bg-white dark:bg-neutral-900 p-6 space-y-5">
        {sent ? (
          <div className="text-center space-y-2">
            <p className="font-medium text-green-600">
              Solicitação enviada
            </p>
            <p className="text-sm text-neutral-500">
              Se este email estiver cadastrado, você receberá as instruções
              para redefinir sua senha.
            </p>
            <p className="text-xs text-neutral-400">
              Verifique também a caixa de spam.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-md border px-3 py-2 text-sm bg-transparent focus:ring-2 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 border rounded-md p-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-sm">
        <Link href="/login" className="underline text-blue-600">
          Voltar para login
        </Link>
      </div>
    </section>
  );
}
