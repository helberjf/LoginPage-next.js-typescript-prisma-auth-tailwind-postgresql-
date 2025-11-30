"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Settings, User, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Perfil", href: "/profile", icon: User },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
      onClose?.();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 
        border-r border-border bg-sidebar transition-transform duration-300 
        md:relative md:top-0 md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <nav className="flex flex-col h-full p-4 space-y-2">

          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href || pathname.startsWith(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    onClose?.();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-colors
                    ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-sidebar-accent-foreground" : ""
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {isAuthenticated && (
            <div className="border-t border-sidebar-border pt-4">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                text-sm font-medium hover:bg-destructive/10 hover:text-destructive 
                disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                {isLoggingOut ? "Saindo..." : "Logout"}
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
