// src/app/page.tsx
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Bem-vindo</h1>

      <p className="text-neutral-500 dark:text-neutral-400">
        Sistema de autenticação com Next.js 16 + Auth.js + Prisma
      </p>

      <div className="flex gap-4">
        <a
          href="/(auth)/login"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Entrar
        </a>

        <a
          href="/(auth)/register"
          className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700"
        >
          Registrar
        </a>
      </div>

      <ThemeSwitcher />
    </main>
  );
}
