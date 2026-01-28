import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerNotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect("/dashboard");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Notificações</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Atualizações recentes da sua conta.
        </p>
      </header>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          Nenhuma notificação até o momento.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{n.title}</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{n.message}</p>
                </div>
                <span className={n.read ? "rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400" : "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300"}>
                  {n.read ? "Lida" : "Nova"}
                </span>
              </div>
              <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(n.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
