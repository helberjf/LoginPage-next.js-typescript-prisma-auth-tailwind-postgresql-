"use client";

import { useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string;
  durationMins: number;
  priceCents: number;
  active: boolean;
};

type Props = {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ServiceBookingModal({
  service,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!date || !time) {
      setError("Data e hora são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/schedules/create-validated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          time,
          notes: notes || null,
          guestName: null,
          guestEmail: null,
          guestPhone: null,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao agendar");
      }

      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao agendar serviço");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calcular data mínima (hoje)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b dark:border-neutral-700">
          <h2 className="text-xl font-bold">Agendar {service.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Data *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hora *</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duração</label>
            <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2 rounded">
              {service.durationMins} minutos
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preço</label>
            <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2 rounded font-bold text-green-600">
              R$ {(service.priceCents / 100).toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-neutral-700 dark:border-neutral-600"
              placeholder="Observações adicionais (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {loading ? "Agendando..." : "Agendar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
