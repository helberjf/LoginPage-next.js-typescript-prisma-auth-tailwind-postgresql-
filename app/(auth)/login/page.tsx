import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar na conta | Seu App",
  description:
    "Acesse sua conta com segurança para gerenciar pedidos, dados e configurações.",

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },

  openGraph: {
    title: "Entrar na conta | Seu App",
    description:
      "Acesso seguro à sua conta para gerenciar pedidos e informações.",
    type: "website",
  },

  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage() {
  const session = await auth();

  // 🔒 Usuário já autenticado
  if (session) {
    if (session.user?.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      role="main"
      aria-labelledby="login-title"
    >
      <section className="w-full max-w-sm">
        <h1
          id="login-title"
          className="text-xl font-semibold mb-4 text-center"
        >
          Acesse sua conta
        </h1>

        <LoginForm />

        <nav
          className="mt-4 text-center text-xs space-y-1"
          aria-label="Links auxiliares de autenticação"
        >
          <p>
            <a
              href="/forgot-password"
              className="underline text-blue-600"
            >
              Esqueceu sua senha?
            </a>
          </p>

          <p>
            Não tem conta?{" "}
            <a
              href="/register"
              className="underline text-blue-600"
            >
              Criar conta
            </a>
          </p>
        </nav>
      </section>
    </main>
  );
}
