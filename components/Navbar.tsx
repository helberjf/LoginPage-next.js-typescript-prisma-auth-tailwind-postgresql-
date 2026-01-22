// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
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
      <div className="relative max-w-7xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* ESQUERDA - Toggle (Mobile e Desktop) */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* CENTRO ABSOLUTO — Logo (Mobile e Desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <Link
            href="/"
            aria-label="Página inicial"
            className="flex items-center justify-center px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Image
              src="/images/brand/image-removebg-preview-1.webp"
              alt="Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
        
        {/* DIREITA - Ícones e Menu */}
        <nav className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Desktop - Ações + Carrinho */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/services" className="text-sm hover:underline">
              Serviços
            </Link>
            <Link href="/schedules" className="text-sm hover:underline">
              Agendar
            </Link>
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

          {/* Mobile - Carrinho */}
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