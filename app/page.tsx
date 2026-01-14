"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogIn,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";
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
  const [showLoginCard, setShowLoginCard] = useState(true);

  useEffect(() => {
    fetch("/api/products/public")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  // 🔽 Esconde card ao rolar (mobile)
  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;

      if (currentY > lastY && currentY > 80) {
        setShowLoginCard(false);
      } else if (currentY < lastY) {
        setShowLoginCard(true);
      }

      lastY = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 py-6 space-y-10">

      {/* LOGIN COMPACTO (MOBILE TOGGLE) */}
      <section
        className={`max-w-xs mx-auto transition-all duration-300 md:block ${
          showLoginCard ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none md:opacity-100 md:translate-y-0"
        }`}
      >
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-3 space-y-3">

          <header className="text-center space-y-1">
            <div className="flex justify-center">
              <div className="p-2 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Package size={22} />
              </div>
            </div>

            <h1 className="text-sm font-semibold">
              Sistema de produtos
            </h1>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
              Compre também sem cadastro
            </p>
          </header>

          <ul className="space-y-1 text-xs">
            <li className="flex items-center gap-2">
              <ShoppingCart size={14} className="text-green-600" />
              Compre com segurança
            </li>
            <li className="flex items-center gap-2">
              <LayoutDashboard size={14} className="text-purple-600" />
              Histórico e dashboard
            </li>
          </ul>

          <div className="flex flex-col gap-1.5">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                <LayoutDashboard size={12} />
                Dashboard
              </Link>
            ) : (
              <>
                <button
                  onClick={() =>
                    signIn("google", { callbackUrl: "/dashboard" })
                  }
                  className="flex items-center justify-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <FcGoogle size={16} />
                  Continuar com o Google
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <LogIn size={12} />
                  Entrar com email
                </Link>
              </>
            )}
          </div>

          <footer className="flex items-center justify-between pt-2 border-t text-[10px]">
            <ThemeSwitcher />
            {!session && (
              <Link
                href="/register"
                className="text-blue-600 hover:underline"
              >
                Criar conta
              </Link>
            )}
          </footer>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="max-w-7xl mx-auto space-y-4">
        <header className="text-center space-y-1">
          <h2 className="text-xl font-bold">
            Produtos disponíveis
          </h2>
          <p className="text-neutral-500 text-sm">
            Escolha e compre rapidamente
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
