// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
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
            </SidebarProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
