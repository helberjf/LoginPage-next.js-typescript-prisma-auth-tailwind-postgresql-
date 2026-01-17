"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  products: "Produtos",
  new: "Novo",
  edit: "Editar",
  orders: "Pedidos",
  users: "Usuários",
  settings: "Configurações",
};

function humanize(part: string) {
  if (LABELS[part]) return LABELS[part];

  return part
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Detecta IDs:
// - número
// - UUID
// - CUID (Prisma)
function isId(part: string) {
  // número
  if (/^\d+$/.test(part)) return true;

  // UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      part
    )
  )
    return true;

  // CUID (Prisma)
  if (/^c[a-z0-9]{24}$/i.test(part)) return true;

  return false;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const cleanPath = pathname.split("?")[0].split("#")[0];

  let parts = cleanPath
    .replace(/^\/dashboard/, "")
    .split("/")
    .filter(Boolean);

  // remove "admin" e IDs
  parts = parts.filter((p) => p !== "admin" && !isId(p));

  return (
    <nav className="mb-2 text-[11px] text-neutral-500 dark:text-neutral-400">
      <Link
        href="/dashboard"
        className="font-medium hover:text-neutral-900 hover:underline dark:hover:text-white"
      >
        Dashboard
      </Link>

      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;

        return (
          <span key={i}>
            {" / "}
            {isLast ? (
              <span className="font-semibold text-neutral-900 dark:text-white">
                {humanize(part)}
              </span>
            ) : (
              <span className="hover:underline">{humanize(part)}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
