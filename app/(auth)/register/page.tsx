// app/(auth)/register/page.tsx
"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <section className="w-full max-w-sm mx-auto -mt-8 md:mt-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-2 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Voltar para home
      </Link>

      <div className="rounded-lg border bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Criar conta
        </h1>
        <p className="text-sm text-neutral-500 mb-4 text-center">
          Preencha os campos para se registrar.
        </p>

        <RegisterForm />
      </div>
    </section>
  );
}
