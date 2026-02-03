// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import PublicSidebarShell from "@/components/PublicSidebarShell";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "Sistema de Venda Online",
  description: "Não pague comissão para vender seus produtos",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Providers>
          <CartProvider>
            <SidebarProvider>
              {/* Navbar COMPLETO, sem reduzir nada */}
              <Navbar />

              {/* Sidebar desktop e mobile para visitante */}
              <PublicSidebarShell />
              
              {/* Main content */}
              {children}

              <Link
                href="https://wa.me/5532991949689"
                target="_blank"
                rel="noreferrer"
                className="fixed right-3 bottom-24 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-green-200/70 bg-white text-green-600 shadow-sm hover:bg-green-50 dark:border-green-900/40 dark:bg-neutral-900"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            </SidebarProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
