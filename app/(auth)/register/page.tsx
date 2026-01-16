// app/(auth)/register/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <section className="w-full max-w-sm mx-auto mt-2 sm:mt-4 px-2">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-1 text-[13px] font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para home
      </Link>

      <div className="rounded-lg border bg-white dark:bg-neutral-900 px-4 py-4 shadow-sm">
        <h1 className="text-lg font-bold mb-1 text-center">
          Criar conta
        </h1>

        <p className="text-[12.5px] text-neutral-500 mb-3 text-center">
          Preencha os campos para se registrar.
        </p>

        <RegisterForm />
      </div>
    </section>
  );
}
