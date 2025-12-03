// src/app/(auth)/register/page.tsx
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Criar conta
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 text-center">
          Preencha os campos para se registrar.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
