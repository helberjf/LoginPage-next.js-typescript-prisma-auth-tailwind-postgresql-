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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  async function onSubmit(values: LoginSchema) {
    setServerError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (!res) return setServerError("Erro no servidor. Tente novamente mais tarde.");
    if (res.error) return setServerError("Credenciais inválidas.");

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-background text-black dark:text-dark-foreground p-10 rounded-3xl shadow-2xl">
        {/* Título */}
        <h1 className="text-4xl font-extrabold mb-2 text-center text-gray-700">Bem-vindo</h1>
        <p className="text-gray-600 dark:text-gray-700 mb-8 text-center">
          Use seu email e senha para entrar
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
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

          <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-700">
            <label className="inline-flex items-center">
              <input
                {...register("remember")}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
              />
              <span className="ml-2">Lembrar-me</span>
            </label>

            <a
              href="#"
              className="text-primary dark:text-primary-light font-medium hover:underline"
            >
              Esqueci a senha
            </a>
          </div>

          {serverError && (
            <p className="text-red-600 text-sm">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl border-2 border-solid border-blue-950 hover:opacity-60 bg font-semibold text-black bg-primary hover:bg-primary-dark cursor-pointer"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Link secundário */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-500">
          <p>
            Não tem conta?{" "}
            <a
              href="/register"
              className="font-semibold text-primary dark:text-primary-light hover:underline"
            >
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
