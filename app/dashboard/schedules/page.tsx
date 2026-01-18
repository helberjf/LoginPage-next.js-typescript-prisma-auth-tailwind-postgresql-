import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default async function CustomerSchedulesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Verificar se é CUSTOMER
  if (session.user.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  // Buscar agendamentos do usuário logado
  const schedules = await prisma.schedule.findMany({
    where: { userId: session.user.id },
    orderBy: { startAt: "asc" },
    include: {
      order: {
        select: { id: true },
      },
    },
  });

  function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Meus Agendamentos
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gerencie seus serviços e agendamentos
          </p>
        </div>

        {/* Lista de agendamentos */}
        {schedules.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Nenhum agendamento encontrado
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Você ainda não possui agendamentos agendados.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Calendar className="w-4 h-4" />
              Agendar um serviço
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile: Cards */}
            <div className="md:hidden space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={schedule.status} size="sm" />
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {schedule.type === "SERVICE" ? "Serviço" : 
                           schedule.type === "DELIVERY" ? "Entrega" : "Reunião"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {schedule.notes || "Agendamento sem descrição"}
                      </h3>
                    </div>
                  </div>

                  {/* Data e hora */}
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateTime(schedule.startAt)}</span>
                  </div>

                  {/* Duração */}
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Duração: {Math.round((new Date(schedule.endAt).getTime() - new Date(schedule.startAt).getTime()) / (1000 * 60))} minutos
                  </div>

                  {/* Link para detalhes */}
                  {schedule.orderId && (
                    <Link
                      href={`/dashboard/orders/${schedule.orderId}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver pedido associado
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          Data e Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          Duração
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {schedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={schedule.status} size="sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {schedule.type === "SERVICE" ? "Serviço" : 
                             schedule.type === "DELIVERY" ? "Entrega" : "Reunião"}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                            <div className="max-w-xs truncate">
                              {schedule.notes || "Sem descrição"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {formatDateTime(schedule.startAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {Math.round((new Date(schedule.endAt).getTime() - new Date(schedule.startAt).getTime()) / (1000 * 60))} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
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
