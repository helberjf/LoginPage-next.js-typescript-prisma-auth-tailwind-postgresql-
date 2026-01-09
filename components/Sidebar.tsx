import Link from "next/link";
import { Home, Layers, Box, Users } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { Session } from "next-auth";

type SidebarProps = {
  user: Session["user"];
};

export default function Sidebar({ user }: SidebarProps) {
  const isAdmin = user.role === "ADMIN";

  return (
    <aside className="w-64 p-6 border-r border-neutral-200 dark:border-neutral-800 hidden md:block bg-white dark:bg-neutral-900">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-medium">
            {(user.name || "U").charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{user.name ?? "Usuário"}</div>
            <div className="text-xs text-neutral-500">{user.email ?? ""}</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col text-sm gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Home size={16} /> <span>Home</span>
        </Link>

        <Link
          href="/test-env"
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Layers size={16} /> <span>Test Environment</span>
        </Link>

        {isAdmin && (
          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Box size={16} /> <span>Products</span>
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/app/api/users"
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-70"
          >
            <Users size={16} /> <span>Users</span>
          </Link>
        )}

        <SignOutButton />
      </nav>

      <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
        <div>
          Role:{" "}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {user.role}
          </span>
        </div>
      </div>
    </aside>
  );
}
