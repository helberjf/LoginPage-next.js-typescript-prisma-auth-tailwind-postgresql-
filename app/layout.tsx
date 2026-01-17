// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { auth } from "@/auth";
import SidebarMobile from "@/components/SidebarMobile";
import { SidebarProvider } from "@/contexts/SidebarContext";

export const metadata: Metadata = {
  title: "Sistema de Venda Online",
  description: "Não pague comissão para vender seus produtos",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Providers>
          <SidebarProvider>
            {/* Navbar COMPLETO, sem reduzir nada */}
            <Navbar />
            
            {/* SidebarMobile para todos os usuários */}
            <SidebarMobile user={session?.user || undefined} />
            
            {children}
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
