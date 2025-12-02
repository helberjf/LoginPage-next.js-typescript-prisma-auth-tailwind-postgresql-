// src/app/(auth)/login/LoginForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "@/lib/auth/validation";
import Input from "@/components/form/Input";
import Button from "@/components/form/Button";

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(loginSchema)
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setError(null);
    setLoading(true);

    try {
      // Get CSRF token (Auth.js handler exposes /api/auth/csrf)
      let csrf = "";
      try {
        const tokenRes = await fetch("/api/auth/csrf");
        if (tokenRes.ok) {
          const tokenJson = await tokenRes.json();
          csrf = tokenJson?.csrfToken ?? "";
        }
      } catch (e) {
        // ignore — some handlers accept without CSRF
      }

      const body = new URLSearchParams();
      if (csrf) body.set("csrfToken", csrf);
      body.set("callbackUrl", "/dashboard");
      body.set("email", data.email);
      body.set("password", data.password);

      const res = await fetch("/api/auth/signin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        redirect: "manual"
      });

      // If the handler redirects, follow it
      if (res.status >= 300 && res.status < 400) {
        const redirectUrl = res.headers.get("location");
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "Falha no login");
        setError(text || "Falha no login");
        setLoading(false);
        return;
      }

      // fallback
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Erro desconhecido");
      setLoading(false);
    }
  }

  const handleGoogle = () => {
    window.location.href = "/api/auth/signin/google?callbackUrl=/dashboard";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Email</label>
        <Input type="email" {...register("email")} />
      </div>

      <div>
        <label className="block text-sm mb-1">Senha</label>
        <Input type="password" {...register("password")} />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <Button type="button" onClick={handleGoogle} className="bg-white text-black border">
          Google
        </Button>
      </div>

      <div className="flex justify-between text-sm">
        <a href="/(auth)/forgot-password" className="text-blue-600">Esqueci minha senha</a>
        <a href="/(auth)/register" className="text-blue-600">Registrar</a>
      </div>
    </form>
  );
}
