// app/dashboard/staff/schedules/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default async function StaffSchedulesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Proteção por role
  if (session.user.role === "CUSTOMER") {
    redirect("/schedules");
  }

  if (session.user.role === "ADMIN") {
    redirect("/dashboard/admin/schedules");
  }

  // STAFF: buscar apenas agendamentos atribuídos a ele
  const schedules = await prisma.schedule.findMany({
    where: {
      employeeId: session.user.id,
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      order: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  function durationMinutes(start: Date, end: Date) {
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60)
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Minha Agenda
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Serviços e compromissos atribuídos a você
          </p>
        </div>

        {/* Conteúdo */}
        {schedules.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Nenhum agendamento encontrado
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Você não possui serviços atribuídos no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile */}
            <div className="md:hidden space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={schedule.status} size="sm" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {schedule.type === "SERVICE"
                        ? "Serviço"
                        : schedule.type === "DELIVERY"
                        ? "Entrega"
                        : "Reunião"}
                    </span>
                  </div>

                  {/* Cliente */}
                  <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <User className="w-4 h-4" />
                    <span>
                      Cliente: {schedule.user?.name ?? "Não informado"}
                    </span>
                  </div>

                  {/* Data */}
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateTime(schedule.startAt)}</span>
                  </div>

                  {/* Duração */}
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Duração: {durationMinutes(schedule.startAt, schedule.endAt)}{" "}
                    minutos
                  </div>

                  {/* Observações */}
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
                    {schedule.notes || "Sem observações"}
                  </div>

                  {/* Pedido */}
                  {schedule.orderId && (
                    <Link
                      href={`/dashboard/orders/${schedule.orderId}`}
                      className="inline-flex text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver pedido associado
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Data / Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Duração
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Observações
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {schedules.map((schedule) => (
                        <tr
                          key={schedule.id}
                          className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          <td className="px-6 py-4">
                            <StatusBadge
                              status={schedule.status}
                              size="sm"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {schedule.type === "SERVICE"
                              ? "Serviço"
                              : schedule.type === "DELIVERY"
                              ? "Entrega"
                              : "Reunião"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {schedule.user?.name ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {formatDateTime(schedule.startAt)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {durationMinutes(
                              schedule.startAt,
                              schedule.endAt
                            )}{" "}
                            min
                          </td>
                          <td className="px-6 py-4 text-sm max-w-xs truncate">
                            {schedule.notes || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {schedule.orderId && (
                              <Link
                                href={`/dashboard/orders/${schedule.orderId}`}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Ver pedido
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
