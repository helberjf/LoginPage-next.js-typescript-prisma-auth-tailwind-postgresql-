// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Store, Menu, ShoppingBag } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const { itemCount } = useCart();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900">
      <div className="relative max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center">
        {/* ESQUERDA - Mobile: Toggle + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile: Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile: Logo ao lado do toggle */}
          <Link
            href="/"
            aria-label="Página inicial"
            className="flex items-center justify-center p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors md:hidden"
          >
            <Store className="w-6 h-6 text-neutral-800 dark:text-neutral-100" />
          </Link>
    
          {/* Desktop: "Sua loja" */}
          {!isDashboard && (
            <Link
              href="/"
              className="hidden md:inline-block px-3 py-1.5 rounded-lg border border-neutral-300 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Sua loja
            </Link>
          )}
        </div>
        
        {/* CENTRO ABSOLUTO — logo desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <Link
            href="/"
            aria-label="Página inicial"
            className="flex items-center justify-center px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Store className="w-7 h-7 text-neutral-800 dark:text-neutral-100" />
          </Link>
        </div>
        
        {/* DIREITA */}
        <nav className="ml-auto flex items-center gap-3 sm:gap-4">
          {/* Desktop - Links + Carrinho juntos */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/products" className="text-sm hover:underline">
              Produtos
            </Link>

            {/* Cart icon with badge */}
            <Link
              href="/checkout"
              className="relative p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Carrinho de compras"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-800 dark:text-neutral-100" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          
            {session ? (
              <>
                {!isDashboard && (
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 rounded-md bg-neutral-900 text-white text-sm hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Dashboard
                  </Link>
                )}
  
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-sm hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm hover:underline">
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile - Apenas Carrinho */}
          <Link
            href="/checkout"
            className="relative p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors md:hidden"
            aria-label="Carrinho de compras"
          >
            <ShoppingBag className="w-5 h-5 text-neutral-800 dark:text-neutral-100" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}