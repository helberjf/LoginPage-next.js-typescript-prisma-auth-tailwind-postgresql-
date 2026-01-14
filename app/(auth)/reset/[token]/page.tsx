// app/(auth)/reset/[token]/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Link inválido ou expirado.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Token inválido ou expirado.");
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao redefinir senha."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <p className="text-center text-sm text-red-500">
        Link inválido ou expirado.
      </p>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-800 via-blue-800 to-slate-800 p-4">
      <div className="w-full max-w-xs mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para login
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/10">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-extrabold text-white mb-2">
                Senha alterada!
              </h1>
              <p className="text-sm text-gray-400">
                Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-white text-center mb-2">
                Redefinir senha
              </h1>

              <form onSubmit={submit} className="space-y-4">
                {/* Nova senha */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Lock className="w-4 h-4" />
                    Nova senha
                    <button
                      type="button"
                      className="ml-auto"
                      onClick={() => setShowPass(v => !v)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full rounded-xl bg-slate-700/50 text-white px-4 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Lock className="w-4 h-4" />
                    Confirmar senha
                    <button
                      type="button"
                      className="ml-auto"
                      onClick={() => setShowConfirm(v => !v)}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </label>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    className="w-full rounded-xl bg-slate-700/50 text-white px-4 py-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-xs text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 text-white py-2 font-bold disabled:opacity-50"
                >
                  {loading ? "Alterando..." : "Alterar senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
