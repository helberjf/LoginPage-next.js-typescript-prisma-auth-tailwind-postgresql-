// src/app/(auth)/reset/[token]/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/auth/validation";
import type { z } from "zod";
import { useState } from "react";
import Input from "@/components/form/Input";
import Button from "@/components/form/Button";

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPage({ params }: { params: { token: string } }) {
  const token = params.token;
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema)
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setMsg(null);
    if (data.password !== data.confirm) {
      setMsg("As senhas não conferem");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password: data.password, confirm: data.confirm })
      });

      if (res.ok) {
        setMsg("Senha redefinida com sucesso. Redirecionando para login...");
        setTimeout(() => (window.location.href = "/(auth)/login"), 1500);
      } else {
        const json = await res.json().catch(() => ({}));
        setMsg(json?.error || "Erro ao redefinir senha");
      }
    } catch (err) {
      setMsg("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
        <p className="text-sm mb-3">Email: {email || "—"}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nova senha</label>
            <Input type="password" {...register("password")} />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirmar senha</label>
            <Input type="password" {...register("confirm")} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </form>

        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
