"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@/lib/validators/auth";
import FormInput from "@/components/FormInput";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: LoginSchema) {
    setServerError(null);

    // NextAuth retorna:
    // { ok: boolean; error: string | null; status: number; url: string | null } | undefined
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    // Se res for undefined -> NextAuth não está configurado ainda
    if (!res) {
      setServerError("Erro no servidor. Tente novamente mais tarde.");
      return;
    }

    // Se veio erro explícito do NextAuth
    if (res.error) {
      setServerError("Credenciais inválidas.");
      return;
    }

    // Login OK
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Entrar</h1>
        <p className="text-sm text-gray-500 mb-4">
          Use seu email e senha para entrar.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            id="email"
            label="Email"
            type="email"
            placeholder="seu@exemplo.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <FormInput
            id="password"
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between mb-4">
            <label className="inline-flex items-center text-sm">
              <input
                {...register("remember")}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="ml-2">Lembrar-me</span>
            </label>

            <a href="#" className="text-sm text-blue-600 hover:underline">
              Esqueci a senha
            </a>
          </div>

          {serverError && (
            <p className="text-red-600 text-sm mb-3">{serverError}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          <p>
            Não tem conta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
