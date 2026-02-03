"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ScheduleItem = {
  id: string;
  startAt: string;
  status: string;
  service: {
    name: string;
  };
  employee?: {
    name: string | null;
  } | null;
};

type UpcomingSchedulesProps = {
  schedules: ScheduleItem[];
  statusLabel: Record<string, string>;
  statusClass: Record<string, string>;
};

export default function UpcomingSchedules({
  schedules,
  statusLabel,
  statusClass,
}: UpcomingSchedulesProps) {
  const [items, setItems] = useState<ScheduleItem[]>(schedules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(false);

  const canCancel = useMemo(() => {
    if (!pendingCancel) return false;
    return pendingCancel.status === "PENDING" || pendingCancel.status === "CONFIRMED";
  }, [pendingCancel]);

  const handleOpenDialog = (schedule: ScheduleItem) => {
    setPendingCancel(schedule);
    setDialogOpen(true);
  };

  const handleCancelSchedule = async () => {
    if (!pendingCancel) return;

    try {
      setLoading(true);
      const response = await fetch("/api/schedules/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: pendingCancel.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Não foi possível cancelar o agendamento");
      }

      setItems((prev) => prev.filter((item) => item.id !== pendingCancel.id));
      setDialogOpen(false);
      setPendingCancel(null);
      toast.success("Agendamento cancelado com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cancelar";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Você ainda não tem agendamentos confirmados.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((schedule) => {
            const startDate = new Date(schedule.startAt);
            return (
              <div
                key={schedule.id}
                className="flex flex-col gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {schedule.service.name}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      statusClass[schedule.status]
                    }`}
                  >
                    {statusLabel[schedule.status] ?? schedule.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                  <span>
                    {startDate.toLocaleDateString("pt-BR")} às {" "}
                    {startDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {schedule.employee?.name && (
                    <span>• {schedule.employee.name}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(
                      "Solicitação de contato"
                    )}&message=${encodeURIComponent(
                      `Olá, gostaria de solicitar o contato referente ao agendamento #${schedule.id.slice(
                        0,
                        8
                      )} (${schedule.service.name}) em ${startDate.toLocaleDateString(
                        "pt-BR"
                      )} às ${startDate.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}.`
                    )}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Contato
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenDialog(schedule)}
                    className="inline-flex items-center rounded-full border border-red-200/70 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-neutral-900"
                  >
                    Cancelar agendamento
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-neutral-600 dark:text-neutral-300">
            {pendingCancel && (
              <p>
                {pendingCancel.service.name} • {new Date(pendingCancel.startAt).toLocaleDateString("pt-BR")} às {" "}
                {new Date(pendingCancel.startAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSchedule}
              disabled={loading || !canCancel}
            >
              {loading ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}