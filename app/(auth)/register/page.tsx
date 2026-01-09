// src/app/(auth)/register/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 mb-4 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para home
        </Link>
        <div className="rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Criar conta
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 text-center">
            Preencha os campos para se registrar.
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
