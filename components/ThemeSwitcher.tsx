/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs opacity-50"
        style={{ pointerEvents: "none" }}
      >
        ...
      </button>
    );
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs"
    >
      {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo escuro"}
    </button>
  );
}
