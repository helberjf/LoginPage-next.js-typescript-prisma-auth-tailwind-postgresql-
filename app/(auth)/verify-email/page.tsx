"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token inválido.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          setStatus("error");
          setMessage(json?.error ?? "Token inválido ou expirado.");
          return;
        }

        setStatus("success");
        setMessage("Email confirmado com sucesso.");

        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } catch {
        setStatus("error");
        setMessage("Erro ao verificar email.");
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white dark:bg-neutral-900 p-6 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-lg font-semibold mb-2">
              Verificando email…
            </h1>
            <p className="text-sm text-neutral-500">
              Aguarde alguns segundos.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-lg font-semibold text-green-600 mb-2">
              Email confirmado
            </h1>
            <p className="text-sm text-neutral-600">
              Você será redirecionado para o login.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-lg font-semibold text-red-600 mb-2">
              Erro
            </h1>
            <p className="text-sm text-neutral-600 mb-4">
              {message}
            </p>

            <a
              href="/login"
              className="inline-block text-blue-600 hover:underline text-sm"
            >
              Ir para login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
