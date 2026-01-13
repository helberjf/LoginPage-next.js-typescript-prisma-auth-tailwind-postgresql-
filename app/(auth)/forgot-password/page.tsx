"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
        setError("Erro ao enviar email. Tente novamente.");
      }
    } catch {
      setError("Erro ao enviar email. Tente novamente.");
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
              <p className="font-semibold text-green-600">
                Email enviado com sucesso
              </p>
              <p className="text-sm text-neutral-500">
                Se o email existir, você receberá as instruções em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

        {/* Footer links */}
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
