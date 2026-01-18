import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Filter, User, Clock } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default async function AdminSchedulesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Verificar se é ADMIN
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar todos os agendamentos com dados do usuário
  const schedules = await prisma.schedule.findMany({
    orderBy: { startAt: "desc" },
    include: {
      user: {
        select: { 
          id: true, 
          name: true, 
          email: true 
        },
      },
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

  // Agrupar por data para melhor visualização
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const dateKey = new Date(schedule.startAt).toLocaleDateString("pt-BR");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, typeof schedules>);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Todos os Agendamentos
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Gerencie todos os agendamentos do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filtros futuros podem ser adicionados aqui */}
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Pendentes</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {schedules.filter(s => s.status === "PENDING").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Confirmados</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {schedules.filter(s => s.status === "CONFIRMED").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Concluídos</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {schedules.filter(s => s.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Cancelados</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {schedules.filter(s => s.status === "CANCELLED" || s.status === "NO_SHOW").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de agendamentos agrupados por data */}
        {schedules.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Nenhum agendamento encontrado
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Não há agendamentos cadastrados no sistema.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(schedulesByDate).map(([date, daySchedules]) => (
              <div key={date}>
                {/* Header da data */}
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {date}
                  </h3>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    ({daySchedules.length} agendamento{daySchedules.length !== 1 ? "s" : ""})
                  </span>
                </div>

                {/* Lista de agendamentos do dia */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Horário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Cliente
                          </th>
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
                            Duração
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {daySchedules.map((schedule) => (
                          <tr key={schedule.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              {new Date(schedule.startAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-neutral-400" />
                                <div>
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {schedule.user.name}
                                  </p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {schedule.user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={schedule.status} size="sm" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              {schedule.type === "SERVICE" ? "Serviço" : 
                               schedule.type === "DELIVERY" ? "Entrega" : "Reunião"}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100">
                              <div className="max-w-xs">
                                {schedule.notes || "Sem descrição"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              {Math.round((new Date(schedule.endAt).getTime() - new Date(schedule.startAt).getTime()) / (1000 * 60))} min
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                {schedule.orderId && (
                                  <Link
                                    href={`/dashboard/admin/orders/${schedule.orderId}`}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    Ver pedido
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
