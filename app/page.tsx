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

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;

  salesCount?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;

  discountPercent?: number | null;
  hasFreeShipping?: boolean;

  category?: {
    slug: string;
    name: string;
  };

  images?: {
    url: string;
    position?: number;
  }[];
};

export default function Home() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [showLoginCard, setShowLoginCard] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const role = session?.user?.role ?? "noUser";
  const canShowProducts = role === "noUser" || role === "CUSTOMER";

  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (role !== "noUser" && role !== "CUSTOMER") {
      setProducts([]);
      return;
    }
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);

    fetch(`/api/products/public?${params.toString()}`)
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch((error) => {
        console.error("Failed to load products:", error);
      });
  }, [categoryId, role]);

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
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 py-4 sm:py-6 space-y-6 sm:space-y-10">

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
                  className="flex items-center justify-center gap-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 px-2 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
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

      {canShowProducts && (
        <section className="max-w-7xl mx-auto space-y-3 sm:space-y-4 px-1 sm:px-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-center">
            <Link
              href="/products"
              className="flex-1 sm:flex-none text-center rounded-md bg-blue-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ver produtos
            </Link>
            <Link
              href="/services"
              className="flex-1 sm:flex-none text-center rounded-md bg-emerald-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Agendar serviços
            </Link>
          </div>

          <header className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold">
                Produtos disponíveis
              </h2>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1 rounded text-sm text-neutral-900 dark:text-neutral-100"
                disabled={loadingCategories}
              >
                <option value="">{loadingCategories ? "Carregando..." : "Todas as categorias"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-neutral-500 text-sm">
              Escolha e compre rapidamente
            </p>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}