import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Next Auth Starter",
  description: "Projeto base com Next.js 16, Auth.js, Prisma, Tailwind v4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {/* Navbar global */}
            <Navbar />

            {/* Conteúdo das páginas */}
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
