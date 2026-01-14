"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

import { loginSchema, LoginInput } from "@/lib/auth/validation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl") && searchParams.get("callbackUrl") !== "/"
      ? searchParams.get("callbackUrl")!
      : "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    if (loading || googleLoading) return;

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Email ou senha inválidos");
      return;
    }

    router.push(callbackUrl);
  }

  function handleGoogleLogin() {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    signIn("google", { callbackUrl });
  }

  return (
    <div className="w-full space-y-4">
      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* EMAIL */}
        <div className="space-y-0.5">
          <label
            htmlFor="email"
            className="text-xs font-medium"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register("email")}
            disabled={loading || googleLoading}
            className="w-full rounded-md border px-2.5 py-1.5 text-sm bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 disabled:opacity-60"
          />
          {errors.email && (
            <p className="text-[11px] text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-0.5">
          <label
            htmlFor="password"
            className="text-xs font-medium"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            disabled={loading || googleLoading}
            className="w-full rounded-md border px-2.5 py-1.5 text-sm bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 disabled:opacity-60"
          />
          {errors.password && (
            <p className="text-[11px] text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-xs text-red-500 text-center">
            {error}
          </p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="
            w-full rounded-md bg-blue-600 text-white
            text-sm py-1.5
            hover:bg-blue-700
            disabled:opacity-50
            transition-colors
          "
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {/* DIVIDER */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-300 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-white dark:bg-neutral-950 px-2 text-neutral-500">
            ou continue com
          </span>
        </div>
      </div>

      {/* GOOGLE BUTTON */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="w-full flex items-center justify-center gap-2 rounded-md border py-1.5 text-sm font-medium bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100 hover:shadow-sm dark:bg-neutral-950 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900 disabled:opacity-60 transition-all"
      >
        {googleLoading ? (
          <span
            className="
              w-4 h-4 rounded-full border-2
              border-neutral-300 border-t-neutral-600
              dark:border-neutral-600 dark:border-t-neutral-200
              animate-spin
            "
          />
        ) : (
          <FcGoogle className="text-lg" />
        )}

        {googleLoading ? "Conectando..." : "Continuar com Google"}
      </button>
    </div>
  );
}
