"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto h-14 px-6 flex items-center justify-between">
        {/* Logo / Home */}
        <Link href="/" className="font-semibold text-lg hover:opacity-80">
          Sua loja
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/products" className="hover:underline">
            Produtos
          </Link>

          {session ? (
            <>
              {/* Só aparece fora do dashboard */}
              {!isDashboard && (
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800
                             dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Dashboard
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50
                           dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Sair
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
