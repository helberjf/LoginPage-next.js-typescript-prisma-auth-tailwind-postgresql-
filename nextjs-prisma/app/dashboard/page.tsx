// src/app/(dashboard)/page.tsx
import { auth } from "../../../my-app/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Olá, {session?.user?.name ?? "Usuário"} 👋</h1>

      <div className="p-4 rounded-md border border-neutral-300 dark:border-neutral-700">
        <p className="text-neutral-700 dark:text-neutral-300">
          Email: {session?.user?.email}
        </p>
      </div>

      <a
        href="/api/auth/signout"
        className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Sair
      </a>
    </div>
  );
}
