"use client";

import ServiceForm from "./ServiceForm";

type Service = {
  id: string;
  name: string;
  description: string;
  durationMins: number;
  priceCents: number;
  active: boolean;
  images?: {
    url: string;
    position: number;
  }[];
};

type Props = {
  service?: Service | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ServiceModal({ service, onClose, onSuccess }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {service ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 text-neutral-900 dark:text-neutral-100">
          <ServiceForm
            serviceId={service?.id}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
