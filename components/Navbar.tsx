"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto h-14 px-6 flex items-center justify-between">
        {/* Logo / Home */}
        <Link
          href="/"
          className="font-semibold text-lg hover:opacity-80"
        >
          Sua loja
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/products"
            className="hover:underline"
          >
            Produtos
          </Link>

          {session ? (
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:underline"
              >
                Entrar
              </Link>

            </>
          )}
        </nav>
      </div>
    </header>
  );
}
