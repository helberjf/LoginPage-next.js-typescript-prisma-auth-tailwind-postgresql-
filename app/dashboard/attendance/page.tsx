"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CalendarCheck, Users, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

type ByDay = {
  date: string;
  count: number;
  revenue: number;
};

type ByStatus = {
  status: string;
  label: string;
  count: number;
};

type ByProfessional = {
  id: string;
  name: string;
  count: number;
  avgDuration: number;
  revenue: number;
};

type ProfessionalOption = {
  id: string;
  name: string;
};

type Totals = {
  total: number;
  pending: number;
  completed: number;
  averageDuration: number;
  totalRevenue: number;
};

type AttendanceData = {
  totals: Totals;
  byDay: ByDay[];
  byMonth: { month: string; count: number; revenue: number }[];
  byStatus: ByStatus[];
  byProfessional: ByProfessional[];
  professionals: ProfessionalOption[];
  schedulesList: {
    id: string;
    startAt: string;
    endAt: string;
    status: string;
    paid: boolean;
    orderStatus: string | null;
    customerName: string;
    employeeName: string;
    serviceName: string;
  }[];
  period: { month: number; year: number; view: string };
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"day" | "month">("day");
  const { data: session } = useSession();
  const isAllowed = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams();
        if (selectedProfessional) params.set("employeeId", selectedProfessional);
        params.set("month", String(selectedMonth));
        params.set("year", String(selectedYear));
        params.set("view", viewMode);
        const response = await fetch(`/api/admin/attendance?${params.toString()}`);
        if (!response.ok) throw new Error("Erro ao carregar dados");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erro ao buscar dados de atendimentos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedProfessional, selectedMonth, selectedYear, viewMode]);

  if (!isAllowed) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-lg text-red-600">Acesso não autorizado</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-lg text-neutral-600 dark:text-neutral-400">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-lg text-red-600">Erro ao carregar dados de atendimentos</div>
        </div>
      </div>
    );
  }

  const byDay = data.byDay ?? [];
  const byMonth = data.byMonth ?? [];
  const byStatus = data.byStatus ?? [];
  const byProfessional = data.byProfessional ?? [];
  const professionals = data.professionals ?? [];
  const schedulesList = data.schedulesList ?? [];

  const daysCount = byDay.length;
  const isDense = daysCount > 20;
  const barGap = isDense ? "30%" : "20%";
  const maxBarSize = isDense ? 10 : 16;
  const tickInterval = isDense ? Math.ceil(daysCount / 10) : "preserveStartEnd";

  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(selectedYear, selectedMonth, 1));

  function handlePrevMonth() {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function handleNextMonth() {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="px-4 py-2 md:px-0 md:py-3">
        <h1 className="text-lg md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Controle de Atendimentos
        </h1>
        <p className="text-[11px] md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Visão geral dos atendimentos dos últimos 30 dias
        </p>
      </div>

      {/* Filtros */}
      <div className="px-4 md:px-0">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="md:col-span-1">
              <label htmlFor="professional-filter" className="block text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 md:mb-2">
                Profissional
              </label>
              <select
                id="professional-filter"
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os profissionais</option>
                <option value="unassigned">Sem profissional</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 md:mb-2">
                Mês
              </label>
              <div className="flex items-center justify-between gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs md:text-sm text-neutral-900 dark:text-neutral-100 capitalize">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 md:mb-2">
                Visualização
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-2 text-xs md:text-sm rounded-lg border transition ${
                    viewMode === "day"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`}
                >
                  Por dia
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-2 text-xs md:text-sm rounded-lg border transition ${
                    viewMode === "month"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`}
                >
                  Por mês
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-[11px] md:text-sm text-neutral-600 dark:text-neutral-400">Total de Atendimentos</p>
              <p className="text-lg md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {data.totals.total}
              </p>
            </div>
            <CalendarCheck className="w-8 h-8 md:w-10 md:h-10 text-blue-500 self-end md:self-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-[11px] md:text-sm text-neutral-600 dark:text-neutral-400">Pendentes</p>
              <p className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {data.totals.pending}
              </p>
            </div>
            <Users className="w-8 h-8 md:w-10 md:h-10 text-orange-500 self-end md:self-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-[11px] md:text-sm text-neutral-600 dark:text-neutral-400">Tempo Médio</p>
              <p className="text-lg md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {data.totals.averageDuration} min
              </p>
            </div>
            <Clock className="w-8 h-8 md:w-10 md:h-10 text-purple-500 self-end md:self-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-[11px] md:text-sm text-neutral-600 dark:text-neutral-400">Receita (30d)</p>
              <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                R$ {data.totals.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-green-500 self-end md:self-auto" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="space-y-3 md:space-y-6 px-4 md:px-0">
        {/* Atendimentos por Dia */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-2 md:mb-4">
            <h2 className="text-sm md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Atendimentos por Dia
            </h2>
            <span className="text-[11px] md:text-sm text-neutral-600 dark:text-neutral-400 capitalize">
              {monthLabel}
            </span>
          </div>
          <div className="-mx-3 md:mx-0">
            <ResponsiveContainer width="100%" height={220} className="md:hidden">
              <BarChart data={viewMode === "day" ? byDay : byMonth} barCategoryGap={barGap} margin={{ left: 6, right: 6, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={viewMode === "day" ? "date" : "month"}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return viewMode === "day"
                    ? `${date.getDate()}/${date.getMonth() + 1}`
                    : new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date);
                }}
                tick={{ fontSize: 9 }}
                interval={viewMode === "day" ? tickInterval : "preserveStartEnd"}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("pt-BR")}
                formatter={(value, name) => {
                  if (!value) return ["0", name || ""];
                  if (name === "Receita (R$)") {
                    return [`R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, name];
                  }
                  return [value, name || ""];
                }}
              />
              <Bar yAxisId="left" dataKey="count" fill="#00C49F" name="Atendimentos" maxBarSize={maxBarSize} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#0088FE" name="Receita (R$)" maxBarSize={maxBarSize} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={240} className="hidden md:block">
            <BarChart data={viewMode === "day" ? byDay : byMonth} barCategoryGap={barGap} margin={{ left: 6, right: 6, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={viewMode === "day" ? "date" : "month"}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return viewMode === "day"
                    ? `${date.getDate()}/${date.getMonth() + 1}`
                    : new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(date);
                }}
                interval={viewMode === "day" ? tickInterval : "preserveStartEnd"}
              />
              <YAxis yAxisId="left" label={{ value: "Quantidade", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Receita (R$)", angle: 90, position: "insideRight" }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                formatter={(value, name) => {
                  if (!value) return ["0", name || ""];
                  if (name === "Receita (R$)") {
                    return [`R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, name];
                  }
                  return [value, name || ""];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#00C49F" name="Atendimentos" maxBarSize={maxBarSize} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#0088FE" name="Receita (R$)" maxBarSize={maxBarSize} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Status dos Atendimentos */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <h2 className="text-sm md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 md:mb-4">
            Status dos Atendimentos
          </h2>
          <ResponsiveContainer width="100%" height={220} className="md:hidden">
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={false}
              >
                {byStatus.map((entry, index) => (
                  <Cell key={`cell-${entry.status}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={260} className="hidden md:block">
            <PieChart>
              <Pie
                data={byStatus}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label={false}
              >
                {byStatus.map((entry, index) => (
                  <Cell key={`cell-${entry.status}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", lineHeight: "16px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Atendimentos por Profissional */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6">
          <h2 className="text-sm md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 md:mb-4">
            Atendimentos por Profissional
          </h2>
          <ResponsiveContainer width="100%" height={220} className="md:hidden">
            <BarChart data={byProfessional.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={240} className="hidden md:block">
            <BarChart data={byProfessional} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FFBB28" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Profissionais */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 mx-4 md:mx-0">
        <h2 className="text-sm md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 md:mb-4">
          Resumo por Profissional
        </h2>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-[11px] md:text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3">Profissional</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Atendimentos</th>
                <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Tempo Médio</th>
                <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Receita</th>
              </tr>
            </thead>
            <tbody>
              {byProfessional.map((prof) => (
                <tr key={prof.id} className="border-b dark:border-neutral-700">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-medium">{prof.name}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">{prof.count}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">{prof.avgDuration} min</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                    R$ {prof.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Atendimentos do Período */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 mx-4 md:mx-0">
        <h2 className="text-sm md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2 md:mb-4">
          Atendimentos do Período
        </h2>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-[11px] md:text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3">Data</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Cliente</th>
                <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Profissional</th>
                <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Serviço</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Finalizado</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Pago</th>
              </tr>
            </thead>
            <tbody>
              {schedulesList.map((schedule) => (
                <tr key={schedule.id} className="border-b dark:border-neutral-700">
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    {new Date(schedule.startAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">{schedule.customerName}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">{schedule.employeeName}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">{schedule.serviceName}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        schedule.status === "COMPLETED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                          : schedule.status === "CANCELLED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700"
                      }`}
                    >
                      {schedule.status === "COMPLETED" ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        schedule.paid
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                      }`}
                    >
                      {schedule.paid ? "Pago" : "Pendente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
