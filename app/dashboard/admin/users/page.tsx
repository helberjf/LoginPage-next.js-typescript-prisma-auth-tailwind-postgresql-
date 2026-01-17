// app/dashboard/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@prisma/client";
import Link from "next/link";

function roleLabel(role: Role) {
  return role === "ADMIN"
    ? "Admin"
    : role === "STAFF"
    ? "Staff"
    : "Cliente";
}

function statusColor(status: UserStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "BLOCKED":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "DELETED":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: true },
  });

  return (
    <section className="space-y-3 p-2 sm:p-4">
      <h1 className="text-base font-semibold">Usuários</h1>

      {/* MOBILE – CARDS DENSOS */}
      <div className="grid grid-cols-1 gap-2 md:hidden">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/dashboard/admin/users/${user.id}`}
            className="
              block rounded-md border border-gray-200 bg-white
              transition hover:bg-gray-50
              dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800
            "
          >
            <div className="px-3 py-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.name ?? "Sem nome"}
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {user.email ?? "Sem email"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-[10px] ${statusColor(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                  {roleLabel(user.role)}
                </span>

                {user.profile?.cpf && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                    CPF: {user.profile.cpf}
                  </span>
                )}

                {user.profile?.phone && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                    Tel: {user.profile.phone}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Criado em{" "}
                {user.createdAt.toLocaleDateString("pt-BR")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* DESKTOP – TABELA COM LINHA CLICÁVEL */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b dark:border-gray-800">
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Criado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="
                  border-b cursor-pointer
                  hover:bg-gray-50
                  dark:border-gray-800 dark:hover:bg-gray-800
                "
              >
                <td className="p-2 font-medium">
                  <Link
                    href={`/dashboard/admin/users/${user.id}`}
                    className="block"
                  >
                    {user.name ?? "-"}
                  </Link>
                </td>
                <td className="p-2 text-gray-600 dark:text-gray-400">
                  {user.email ?? "-"}
                </td>
                <td className="p-2">
                  {roleLabel(user.role)}
                </td>
                <td className="p-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] ${statusColor(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-2">
                  {user.createdAt.toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
