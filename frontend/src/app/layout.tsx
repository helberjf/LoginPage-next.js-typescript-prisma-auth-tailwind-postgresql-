// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "LoginApp",
  description: "Demo login with React Hook Form + Zod",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <main className="min-h-screen flex items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
