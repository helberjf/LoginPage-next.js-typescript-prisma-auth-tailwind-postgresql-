"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogIn,
  UserPlus,
} from "lucide-react";

import { FaGoogle } from "react-icons/fa";

import ThemeSwitcher from "../components/ThemeSwitcher";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl p-8 sm:p-10 space-y-10">

          {/* Header */}
          <header className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Package size={32} />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Sistema de Produtos
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
              Autenticação, pedidos e pagamentos em uma plataforma moderna
              construída com Next.js, Auth.js, Prisma e PostgreSQL.
            </p>
          </header>

          {/* Features */}
          <ul className="space-y-3 text-sm sm:text-base">
            <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <ShoppingCart size={18} className="text-green-600" />
              Compra e gerenciamento de pedidos
            </li>

            <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <LayoutDashboard size={18} className="text-purple-600" />
              Dashboard pessoal com histórico
            </li>

            <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <LogIn size={18} className="text-blue-600" />
              Login seguro com Google ou senha
            </li>
          </ul>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 text-white font-medium hover:bg-green-700 transition"
              >
                <LayoutDashboard size={18} />
                Ir para o Dashboard
              </Link>
            ) : (
              <>
                {/* Google */}
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="flex items-center justify-center gap-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-6 py-4 text-neutral-800 dark:text-neutral-100 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                >
                  <FaGoogle className="text-[#DB4437]" size={18} />
                  Entrar com Google
                </button>

                {/* Email / Password */}
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white font-medium hover:bg-blue-700 transition"
                >
                  <LogIn size={18} />
                  Entrar com email
                </Link>

                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-6 py-4 font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <UserPlus size={18} />
                  Criar conta
                </Link>
              </>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-500">
            <span>
              {session
                ? `Logado como ${session.user?.email}`
                : "Você ainda não está autenticado"}
            </span>

            <ThemeSwitcher />
          </footer>
        </div>
      </section>
    </main>
  );
}
