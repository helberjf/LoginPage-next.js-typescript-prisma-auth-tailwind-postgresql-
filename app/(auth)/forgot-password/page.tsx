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

      // 🔒 Sempre tratar como sucesso (anti-enumeração)
      if (res.ok) {
        setSent(true);
      } else {
        // erro real (ex: 500)
        setError("Erro ao processar solicitação. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Recuperar senha</h1>
          <p className="text-neutral-500 text-sm">
            Informe seu email para receber o link de redefinição
          </p>
        </header>

        {/* Card */}
        <div className="border rounded-xl bg-white dark:bg-neutral-900 p-6 space-y-5">
          {sent ? (
            <div className="text-center space-y-2">
              <p className="font-medium text-green-600">
                Solicitação enviada
              </p>
              <p className="text-sm text-neutral-500">
                Se este email estiver cadastrado, você receberá as instruções
                para redefinir sua senha em alguns instantes.
              </p>
              <p className="text-xs text-neutral-400">
                Verifique também a caixa de spam.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 border border-red-200 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="text-neutral-600 hover:underline"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
