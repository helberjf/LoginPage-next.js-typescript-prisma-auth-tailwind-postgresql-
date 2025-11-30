"use client";

import { useTheme } from "next-themes";
import { Menu, X, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Navbar({ onMenuClick, sidebarOpen = false }: NavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTheme = resolvedTheme || theme;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">

        {/* LEFT: sidebar + logo */}
        <div className="flex items-center gap-4">

          {/* Toggle Sidebar */}
          <button
            onClick={onMenuClick}
            className="hidden md:flex w-10 h-10 rounded-lg hover:bg-accent items-center justify-center"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">AuthMarketplace</span>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:opacity-70">Home</Link>
          <Link href="/login" className="hover:opacity-70">Login</Link>
          <Link href="/register" className="hover:opacity-70">Registrar</Link>
        </div>

        {/* THEME TOGGLE */}
        <button
          onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
          className="w-10 h-10 rounded-lg hover:bg-accent flex items-center justify-center"
        >
          {currentTheme === "light" ? <Moon /> : <Sun />}
        </button>

        {/* MOBILE MENU ICON */}
        <button
          className="md:hidden w-10 h-10 ml-2 rounded-lg hover:bg-accent flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="py-4 space-y-1 px-4 text-sm font-medium">
      
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Home
            </Link>
      
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Login
            </Link>
      
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Registrar
            </Link>
      
          </div>
        </div>
      )}
    </nav>
  );
}
