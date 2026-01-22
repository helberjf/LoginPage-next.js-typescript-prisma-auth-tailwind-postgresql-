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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {service ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
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
