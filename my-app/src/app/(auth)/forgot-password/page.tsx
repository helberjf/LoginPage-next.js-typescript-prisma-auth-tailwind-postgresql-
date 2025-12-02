// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import type { z } from "zod";
import Input from "@/components/form/Input";
import Button from "@/components/form/Button";

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setMsg("Se o e-mail existir, enviamos um link para redefinir a senha.");
      } else {
        setMsg("Erro ao processar. Tente novamente mais tarde.");
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
        <h1 className="text-2xl font-bold mb-4">Esqueci minha senha</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input type="email" {...register("email")} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link"}
          </Button>
        </form>

        {msg && <p className="mt-4 text-sm">{msg}</p>}

        <div className="text-sm mt-4">
          <a href="/(auth)/login" className="text-blue-600">Voltar ao login</a>
        </div>
      </div>
    </div>
  );
}
