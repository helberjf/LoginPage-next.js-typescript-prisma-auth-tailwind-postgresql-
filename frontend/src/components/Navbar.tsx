"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Ocultar navbar no login e no registro
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold">
          LoginApp
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/profile" className="hover:underline">Perfil</Link>
          <Link href="/logout" className="hover:underline">Sair</Link>
        </div>
      </div>
    </nav>
  );
}
