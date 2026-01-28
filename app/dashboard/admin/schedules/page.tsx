"use client";

import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Schedule = {
  id: string;
  startAt: string;
  endAt: string;
  notes: string | null;
  service?: { id: string; name: string } | null;
  user?: { id: string; name: string | null; email: string | null } | null;
  employee?: { id: string; name: string | null; email: string | null } | null;
  guestName?: string | null;
  guestEmail?: string | null;
};

export default function AdminSchedulesPage() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [filterByMonth, setFilterByMonth] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const rangeStart = filterByMonth
          ? startOfMonth(selectedMonth)
          : selectedDay
          ? new Date(new Date(selectedDay).setHours(0, 0, 0, 0))
          : startOfMonth(new Date());

        const rangeEnd = filterByMonth
          ? endOfMonth(selectedMonth)
          : selectedDay
          ? new Date(new Date(selectedDay).setHours(23, 59, 59, 999))
          : endOfMonth(new Date());

        const params = new URLSearchParams();
        params.append("start", rangeStart.toISOString());
        params.append("end", rangeEnd.toISOString());

        const res = await fetch(`/api/admin/schedules?${params.toString()}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar agendamentos");
        }

        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [filterByMonth, selectedDay, selectedMonth]);

  useEffect(() => {
    let filtered = schedules;

    // Filtrar por mês
    if (filterByMonth && selectedMonth) {
      filtered = filtered.filter((schedule) =>
        isSameMonth(new Date(schedule.startAt), selectedMonth)
      );
    }
    // Filtrar por dia específico
    else if (selectedDay) {
      filtered = filtered.filter((schedule) =>
        isSameDay(new Date(schedule.startAt), selectedDay)
      );
    }

    // Filtrar por texto
    if (filterText) {
      filtered = filtered.filter((schedule) => {
        const customerName = schedule.user?.name ?? schedule.user?.email ?? schedule.guestName ?? schedule.guestEmail ?? "";
        const serviceName = schedule.service?.name ?? "";
        const professional = schedule.employee?.name ?? schedule.employee?.email ?? "";
        const notes = schedule.notes ?? "";

        const haystack = `${customerName} ${serviceName} ${professional} ${notes}`.toLowerCase();
        return haystack.includes(filterText.toLowerCase());
      });
    }

    setFilteredSchedules(filtered);
  }, [selectedDay, selectedMonth, schedules, filterText, filterByMonth]);

  const footer = selectedDay
    ? `Você selecionou ${format(selectedDay, "PP", { locale: ptBR })}.`
    : "Por favor, selecione um dia.";

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-3 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gerenciar Agendamentos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Visão geral dos agendamentos por dia ou mês.
          </p>
        </div>
        <Button onClick={() => setIsFilterModalOpen(true)}>
          🔍 Filtrar Agendamentos
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Calendário</h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {filterByMonth
                ? format(selectedMonth, "MMMM yyyy", { locale: ptBR })
                : selectedDay
                ? format(selectedDay, "PP", { locale: ptBR })
                : "Selecione um dia"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={filterByMonth ? "default" : "outline"}
              onClick={() => setFilterByMonth(true)}
              size="sm"
            >
              Filtrar por Mês
            </Button>
            <Button
              variant={!filterByMonth ? "default" : "outline"}
              onClick={() => setFilterByMonth(false)}
              size="sm"
            >
              Filtrar por Dia
            </Button>
          </div>

          {filterByMonth ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
                    )
                  }
                >
                  ← Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
                    )
                  }
                >
                  Próximo →
                </Button>
              </div>
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                locale={ptBR}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                className="mx-auto"
              />
            </div>
          ) : (
            <div>
              <p className="text-sm mb-2">{footer}</p>
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                locale={ptBR}
                className="mx-auto"
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Agendamentos
            </h2>
            <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
              {filteredSchedules.length}
            </span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            {filterByMonth
              ? `Mês: ${format(selectedMonth, "MMMM yyyy", { locale: ptBR })}`
              : selectedDay
              ? `Dia: ${format(selectedDay, "PPP", { locale: ptBR })}`
              : "Período selecionado"}
          </p>

          {loading ? (
            <p className="text-sm text-neutral-500">Carregando agendamentos...</p>
          ) : filteredSchedules.length > 0 ? (
            <ul className="space-y-3">
              {filteredSchedules.map((schedule) => {
                const startDate = new Date(schedule.startAt);
                const endDate = new Date(schedule.endAt);
                const customer = schedule.user?.name ?? schedule.user?.email ?? schedule.guestName ?? schedule.guestEmail ?? "Cliente";
                const serviceName = schedule.service?.name ?? "Serviço";
                const professional = schedule.employee?.name ?? schedule.employee?.email ?? "Profissional";

                return (
                  <li
                    key={schedule.id}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {serviceName}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                          {customer}
                        </p>
                      </div>
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                        {format(startDate, "HH:mm")}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                      {format(startDate, "PPP", { locale: ptBR })} • {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Profissional: {professional}
                    </p>
                    {schedule.notes ? (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {schedule.notes}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Nenhum agendamento encontrado para este período.</p>
          )}
        </div>
      </div>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Agendamentos</DialogTitle>
            <DialogDescription>
              Use o campo abaixo para filtrar os agendamentos por texto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center">
              <label htmlFor="filterText" className="text-sm text-neutral-600 dark:text-neutral-300">
                Buscar
              </label>
              <input
                id="filterText"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Nome ou descrição..."
                className="col-span-3 rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsFilterModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
