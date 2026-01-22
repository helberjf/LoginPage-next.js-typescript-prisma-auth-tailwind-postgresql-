"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ServiceBookingModal from "@/components/services/ServiceBookingModal";

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
  isAuthenticated: boolean;
};

export default function ServicesList({ isAuthenticated }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetch("/api/services", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load services");
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  function formatBRL(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const handleBookClick = (service: Service) => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para agendar um serviço");
      window.location.href = "/login";
      return;
    }
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-neutral-600 dark:text-neutral-400">
          Carregando serviços...
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-neutral-600 dark:text-neutral-400">
          Nenhum serviço disponível no momento
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const mainImage = service.images?.[0];
          return (
            <div
              key={service.id}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {mainImage ? (
                <div className="relative w-full h-48">
                  <Image
                    src={mainImage.url}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-neutral-500">Sem imagem</span>
                </div>
              )}

              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>

                {service.description && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span>⏱️ {service.durationMins} min</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatBRL(service.priceCents)}
                  </div>
                </div>

                {!service.active && (
                  <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm text-center">
                    Serviço indisponível
                  </div>
                )}

                <button
                  onClick={() => handleBookClick(service)}
                  disabled={!service.active}
                  className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                    service.active
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {service.active ? "Agendar Agora" : "Indisponível"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedService && (
        <ServiceBookingModal
          service={selectedService}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
            alert("Serviço agendado com sucesso!");
          }}
        />
      )}
    </>
  );
}
