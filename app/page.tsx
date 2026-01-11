"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogIn,
} from "lucide-react";

import { FaGoogle } from "react-icons/fa";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ProductCard from "@/components/products/ProductCard";

type Product = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

export default function Home() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products/public")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 py-10 space-y-16">
      {/* CARD DE LOGIN */}
      <section className="max-w-md mx-auto">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-6 space-y-6">
          <header className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Package size={26} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold">
              Sistema de Produtos
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Compre como visitante ou acesse sua conta
            </p>
          </header>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-green-600" />
              Produtos públicos
            </li>
            <li className="flex items-center gap-2">
              <LayoutDashboard size={16} className="text-purple-600" />
              Dashboard após login
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Package size={16} />
              Ver todos os produtos
            </Link>

            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
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
                  className="flex items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <FaGoogle className="text-[#DB4437]" size={16} />
                  Entrar com Google
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <LogIn size={16} />
                  Entrar com email
                </Link>
              </>
            )}
          </div>

          <footer className="flex items-center justify-between pt-4 border-t text-xs text-neutral-500">
            <span>
              {session
                ? `Logado como ${session.user?.email}`
                : "Acesso público habilitado"}
            </span>
            <ThemeSwitcher />
          </footer>
        </div>
      </section>

      {/* PRODUTOS PÚBLICOS */}
      <section className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Produtos disponíveis</h2>
          <p className="text-neutral-500">
            Você pode comprar mesmo sem criar conta
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isLogged={!!session}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
