"use client";

import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
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
  title: string;
  date: Date;
  time: string;
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

  // Mock de dados de agendamento (substituir por dados da API)
  useEffect(() => {
    const mockSchedules: Schedule[] = [
      { id: "1", title: "Reunião com Cliente A", date: new Date(), time: "10:00" },
      { id: "2", title: "Preparar Relatório", date: new Date(), time: "14:30" },
      { id: "3", title: "Agendamento com B", date: new Date(2026, 0, 22), time: "09:00" },
      { id: "4", title: "Manutenção do Sistema", date: new Date(2026, 0, 22), time: "16:00" },
    ];
    setSchedules(mockSchedules);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = schedules;

    // Filtrar por mês
    if (filterByMonth && selectedMonth) {
      filtered = filtered.filter((schedule) =>
        isSameMonth(schedule.date, selectedMonth)
      );
    }
    // Filtrar por dia específico
    else if (selectedDay) {
      filtered = filtered.filter((schedule) => isSameDay(schedule.date, selectedDay));
    }

    // Filtrar por texto
    if (filterText) {
      filtered = filtered.filter((schedule) =>
        schedule.title.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    setFilteredSchedules(filtered);
  }, [selectedDay, selectedMonth, schedules, filterText, filterByMonth]);

  const footer = selectedDay
    ? `Você selecionou ${format(selectedDay, "PP", { locale: ptBR })}.`
    : "Por favor, selecione um dia.";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Gerenciar Agendamentos</h1>
      <Button onClick={() => setIsFilterModalOpen(true)} className="mb-4">
        🔍 Filtrar Agendamentos
      </Button>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">Calendário</h2>
          <div className="flex gap-2 mb-4">
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
              <p className="text-sm font-medium mb-2">
                Mês: {format(selectedMonth, "MMMM yyyy", { locale: ptBR })}
              </p>
              <div className="flex gap-2 mb-4">
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

        <div className="md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">
            Agendamentos para{" "}
            {filterByMonth
              ? ` ${format(selectedMonth, "MMMM yyyy", { locale: ptBR })}`
              : selectedDay
              ? ` ${format(selectedDay, "PPP", { locale: ptBR })}`
              : " o período selecionado"}
          </h2>
          {loading ? (
            <p>Carregando agendamentos...</p>
          ) : filteredSchedules.length > 0 ? (
            <ul className="space-y-2">
              {filteredSchedules.map((schedule) => (
                <li
                  key={schedule.id}
                  className="p-3 border rounded-md bg-neutral-50 dark:bg-neutral-700"
                >
                  <p className="font-medium">{schedule.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {format(schedule.date, "PPP", { locale: ptBR })} às {schedule.time}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum agendamento encontrado para este período.</p>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="filterText" className="text-right">
                Buscar
              </label>
              <input
                id="filterText"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Nome ou descrição..."
                className="col-span-3 border px-3 py-2 rounded"
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
