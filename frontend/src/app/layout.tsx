import "./globals.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-blue-100 dark:bg-dark-background text-gray-900 dark:text-dark-foreground antialiased min-h-screen">
        <main className="flex items-center justify-center min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
