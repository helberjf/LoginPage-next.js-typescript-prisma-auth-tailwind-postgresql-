// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BadgeCheck,
  CreditCard,
  Receipt,
  ShoppingBag,
  Sparkles,
  Timer,
} from "lucide-react";
import UpcomingSchedules from "@/components/dashboard/UpcomingSchedules";

/**
 * Dashboard do CUSTOMER
 * - Autenticação garantida pelo layout
 * - Aqui garantimos role e dados corretos
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 🔒 ADMIN NÃO DEVE ENTRAR AQUI
  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin/dashboard");
  }

  const userId = session.user.id;
  const now = new Date();

  const [
    totalOrders,
    paidOrders,
    totalSpent,
    lastOrder,
    verificationInfo,
    upcomingSchedules,
  ] = await Promise.all([
    prisma.order.count({
      where: { userId },
    }),

    prisma.order.count({
      where: {
        userId,
        status: "PAID",
      },
    }),

    prisma.order.aggregate({
      where: {
        userId,
        status: "PAID",
      },
      _sum: {
        totalCents: true,
      },
    }),

    prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
      },
    }),

    prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        accounts: {
          where: { provider: "google" },
          select: { id: true },
        },
      },
    }),
    prisma.schedule.findMany({
      where: {
        userId,
        startAt: {
          gte: now,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      orderBy: {
        startAt: "asc",
      },
      take: 5,
      select: {
        id: true,
        startAt: true,
        status: true,
        service: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const totalSpentValue = totalSpent._sum.totalCents
    ? `R$ ${(totalSpent._sum.totalCents / 100).toFixed(2)}`
    : "R$ 0,00";

  const lastOrderLabel = lastOrder
    ? `#${lastOrder.id.slice(0, 8)}`
    : "—";

  const firstName = session.user.name?.split(" ")[0] ?? "Olá";
  const isVerified = Boolean(
    verificationInfo?.emailVerified ||
      (verificationInfo?.accounts?.length ?? 0) > 0
  );

  const scheduleStatusLabel: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Concluído",
    NO_SHOW: "Não compareceu",
  };

  const scheduleStatusClass: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    CONFIRMED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
    NO_SHOW: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header className="rounded-2xl border bg-white/80 dark:bg-neutral-950/80 backdrop-blur p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-blue-600 dark:text-blue-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Resumo da conta</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isVerified
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            <BadgeCheck className="w-3 h-3" />
            {isVerified ? "Conta verificada" : "Conta pendente"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-neutral-900 dark:text-neutral-50">
          {firstName}, confira seu painel
        </h1>
        <p className="text-neutral-500 mt-1">
          Acompanhe pedidos, pagamentos e suas próximas compras.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Ver produtos
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Agendar serviços
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard
          label="Total de pedidos"
          value={totalOrders}
          icon={<ShoppingBag className="w-4 h-4" />}
        />

        <DashboardCard
          label="Pedidos pagos"
          value={paidOrders}
          icon={<BadgeCheck className="w-4 h-4" />}
        />

        <DashboardCard
          label="Total gasto"
          value={totalSpentValue}
          icon={<CreditCard className="w-4 h-4" />}
        />

        <DashboardCard
          label="Último pedido"
          value={lastOrderLabel}
          icon={<Receipt className="w-4 h-4" />}
        />
      </section>

      {/* Último pedido */}
      {lastOrder && (
        <section className="rounded-2xl border bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Último pedido</h2>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Timer className="w-3.5 h-3.5" />
              {lastOrder.status}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
              <span>Pedido</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                #{lastOrder.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
              <span>Total</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                R$ {(lastOrder.totalCents / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Data</span>
              <span>{lastOrder.createdAt.toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </section>
      )}

      {/* Próximos agendamentos */}
      <section className="rounded-2xl border bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Próximos agendamentos</h2>
          <Link
            href="/services"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Agendar novo
          </Link>
        </div>

        <UpcomingSchedules
          schedules={upcomingSchedules.map((schedule) => ({
            ...schedule,
            startAt: schedule.startAt.toISOString(),
          }))}
          statusLabel={scheduleStatusLabel}
          statusClass={scheduleStatusClass}
        />
      </section>

      {/* Ações rápidas */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 text-white px-4 py-3 text-sm font-semibold hover:bg-neutral-800 transition"
        >
          Ver pedidos
        </Link>

        <Link
          href="/dashboard/payments"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
        >
          Pagamentos
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
        >
          Comprar novamente
        </Link>
      </section>
    </div>
  );
}

/* Card reutilizável */
function DashboardCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{label}</span>
        {icon && (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
            {icon}
          </span>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-semibold mt-2 text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}
