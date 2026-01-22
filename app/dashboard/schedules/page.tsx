// app/dashboard/schedules/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, User, CreditCard, Plus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default async function UserSchedulesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect("/dashboard");

  // CUSTOMER: buscar apenas seus agendamentos
  const schedules = await prisma.schedule.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      order: {
        select: { id: true },
      },
      employee: {
        select: {
          id: true,
          name: true,
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header - Mobile First */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Meus Agendamentos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gerencie seus serviços
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </Link>
          </div>
        </div>

        {schedules.length === 0 ? (
          /* Estado vazio - Mobile First */
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum agendamento
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Você ainda não possui agendamentos. Que tal agendar um serviço incrível?
            </p>
            <div className="space-y-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Agendar serviço
              </Link>
            </div>
          </div>
        ) : (
          /* Lista de agendamentos - Mobile First */
          <div className="space-y-4">
            {/* Stats Cards - Mobile First */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-blue-600">{schedules.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-green-600">
                  {schedules.filter(s => s.status === 'CONFIRMED').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Confirmados</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {schedules.filter(s => s.status === 'PENDING').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Pendentes</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center shadow-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {schedules.filter(s => s.status === 'COMPLETED').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Concluídos</div>
              </div>
            </div>

            {/* Lista de agendamentos - Cards mobile-first */}
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-800"
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={schedule.status} size="sm" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {schedule.type === "SERVICE" ? "Serviço" : "Agendamento"}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {schedule.notes || "Serviço agendado"}
                      </h3>
                    </div>
                    {schedule.status === 'PENDING' && (
                      <Link
                        href="/checkout"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition shadow-md"
                      >
                        <CreditCard className="w-3 h-3" />
                        Pagar
                      </Link>
                    )}
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{formatDateTime(schedule.startAt)}</span>
                      <span className="text-gray-400">•</span>
                      <span>{durationMinutes(schedule.startAt, schedule.endAt)} min</span>
                    </div>

                    {schedule.employee && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="w-4 h-4 text-purple-500" />
                        <span>Com {schedule.employee.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    {schedule.orderId && (
                      <Link
                        href={`/dashboard/orders/${schedule.orderId}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver pedido
                      </Link>
                    )}
                    <span className="text-gray-300">•</span>
                    <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Final */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center text-white shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Precisa de mais serviços?</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Agende novos serviços e mantenha sua agenda sempre cheia
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Agendar novo serviço
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}