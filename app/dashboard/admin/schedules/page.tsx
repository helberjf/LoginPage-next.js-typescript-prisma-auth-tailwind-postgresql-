"use client";

import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay } from "date-fns";
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

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
    if (selectedDay) {
      const filteredByDay = schedules.filter((schedule) => isSameDay(schedule.date, selectedDay));
      setFilteredSchedules(
        filteredByDay.filter((schedule) =>
          schedule.title.toLowerCase().includes(filterText.toLowerCase())
        )
      );
    } else {
      setFilteredSchedules(
        schedules.filter((schedule) =>
          schedule.title.toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }
  }, [selectedDay, schedules, filterText]);

  const footer = selectedDay ? (
    <p>Você selecionou {format(selectedDay, "PP", { locale: ptBR })}.</p>
  ) : (
    <p>Por favor, selecione um dia.</p>
  );

  return (
    <div className="container mx-auto p-4">
          <h1 className="text-2xl font-semibold mb-4">Gerenciar Agendamentos</h1>
          <Button onClick={() => setIsFilterModalOpen(true)} className="mb-4">Filtrar Agendamentos</Button>
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">Calendário</h2>
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            footer={footer}
            locale={ptBR}
            className="mx-auto"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-xl font-semibold mb-2">Agendamentos para {selectedDay ? format(selectedDay, "PPP", { locale: ptBR }) : "o dia selecionado"}</h2>
          {loading ? (
            <p>Carregando agendamentos...</p>
          ) : filteredSchedules.length > 0 ? (
            <ul className="space-y-2">
              {filteredSchedules.map((schedule) => (
                <li key={schedule.id} className="p-3 border rounded-md bg-neutral-50 dark:bg-neutral-700">
                  <p className="font-medium">{schedule.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{schedule.time}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum agendamento para este dia.</p>
          )}
          {/* Futuramente: Modal de filtro */}
        </div>
      </div>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Agendamentos</DialogTitle>
            <DialogDescription>Use os campos abaixo para filtrar os agendamentos.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="filterText" className="text-right">Texto</label>
              <input
                id="filterText"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="col-span-3 border px-3 py-2 rounded"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsFilterModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
