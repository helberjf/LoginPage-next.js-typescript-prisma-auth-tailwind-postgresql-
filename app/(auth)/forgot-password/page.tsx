"use client";
import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
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
    } catch (err) {
      setError("Erro ao enviar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-800 via-blue-800 to-slate-800 p-4">
      <div className="w-full max-w-xs mx-auto">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para login
        </Link>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/10">
          <h1 className="text-2xl font-extrabold text-white text-center mb-2">
            Esqueci minha senha
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Digite seu email para receber um link de recuperação
          </p>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-white mb-2">Email enviado!</p>
              <p className="text-sm text-gray-400">
                Se o email existir, você receberá um link para redefinir sua senha.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="rounded-xl border-none bg-slate-700/50 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {error}
                </div>
              )}
              <button 
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
