"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogIn,
} from "lucide-react";

import { FaGoogle } from "react-icons/fa";
import ThemeSwitcher from "@/components/themeSwitcher";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-6 space-y-6">

          {/* Header */}
          <header className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Package size={26} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
              Sistema de Produtos
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Autenticação, pedidos e pagamentos em uma plataforma moderna.
            </p>
          </header>

          {/* Features */}
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <ShoppingCart size={16} className="text-green-600" />
              Compra e pedidos online
            </li>

            <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <LayoutDashboard size={16} className="text-purple-600" />
              Dashboard com histórico
            </li>

            <li className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <LogIn size={16} className="text-blue-600" />
              Login seguro
            </li>
          </ul>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Package size={16} />
              Ver produtos
            </Link>

            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition"
              >
                <LayoutDashboard size={16} />
                Ir para o Dashboard
              </Link>
            ) : (
              <>
                <button
                  onClick={() =>
                    signIn("google", { callbackUrl: "/dashboard" })
                  }
                  className="flex items-center justify-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <FaGoogle className="text-[#DB4437]" size={16} />
                  Entrar com Google
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  <LogIn size={16} />
                  Entrar com email
                </Link>
              </>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
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
