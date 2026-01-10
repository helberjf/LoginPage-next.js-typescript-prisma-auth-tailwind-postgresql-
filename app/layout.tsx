import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
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
        <Providers>
          {/* Navbar COMPLETO, sem reduzir nada */}
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
