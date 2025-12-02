// src/app/(auth)/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { registerSchema } from "@/lib/auth/validation";
import Input from "@/components/form/Input";
import Button from "@/components/form/Button";

type FormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(registerSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.status === 201) {
        // redirect to login
        window.location.href = "/(auth)/login";
        return;
      }

      const json = await res.json().catch(() => ({ error: "Erro" }));
      setError(json?.error || "Erro ao registrar");
    } catch (err: any) {
      setError(err?.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Nome (opcional)</label>
        <Input {...register("name")} />
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <Input type="email" {...register("email")} />
      </div>

      <div>
        <label className="block text-sm mb-1">Senha</label>
        <Input type="password" {...register("password")} />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar conta"}
      </Button>

      <div className="text-sm">
        <a href="/(auth)/login" className="text-blue-600">Já tem conta? Entrar</a>
      </div>
    </form>
  );
}
