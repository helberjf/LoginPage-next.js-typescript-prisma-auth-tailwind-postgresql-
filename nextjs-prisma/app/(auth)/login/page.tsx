// src/app/(auth)/login/page.tsx
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Entrar</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 text-center">
          Acesse sua conta para continuar.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
