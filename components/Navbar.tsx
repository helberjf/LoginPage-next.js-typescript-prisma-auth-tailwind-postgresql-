// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Store, Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="w-full border-b bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto h-14 px-6 flex items-center justify-between">
        
        {/* ESQUERDA — Desktop: "Sua loja" | Mobile: Toggle ou "Sua loja" */}
        <div className="flex items-center gap-4">
          {/* Mobile: Toggle (sempre visível) */}
          <div className="md:hidden">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop: "Sua loja" - some quando estiver em /dashboard */}
          {!isDashboard && (
            <Link
              href="/"
              className="hidden md:inline-block px-3 py-1.5 rounded-lg border border-neutral-300 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Sua loja
            </Link>
          )}
        </div>

        {/* CENTRO — Logo (sempre visível, preparado para imagem) */}
        <Link
          href="/"
          aria-label="Página inicial"
          className="flex items-center px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {/* Logo com imagem - descomentar quando tiver a imagem */}
          {/* <Image 
            src="/logo.svg" 
            alt="Logo" 
            width={28} 
            height={28}
            className="w-7 h-7"
          /> */}
          {/*
            Versão com imagem:
            <Image src="/logo.svg" alt="Logo" width={28} height={28} />
          */}
          
          {/* Logo ícone - Lucide React */}
          <Store className="w-7 h-7 text-neutral-800 dark:text-neutral-100" />
        </Link>

        {/* DIREITA — Desktop: Produtos Dashboard Sair/Entrar | Mobile: Entrar/Produtos/Categorias */}
        <nav className="flex items-center gap-4 text-sm">
          {/* Mobile: Navegação simplificada */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/products" className="hover:underline">
              Produtos
            </Link>
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:underline"
              >
                Sair
              </button>
            ) : (
              <Link href="/login" className="hover:underline">
                Entrar
              </Link>
            )}
          </div>

          {/* Desktop: Navegação completa */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/products" className="hover:underline">
              Produtos
            </Link>

            {session ? (
              <>
                {!isDashboard && (
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="hover:underline">
                Entrar
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
