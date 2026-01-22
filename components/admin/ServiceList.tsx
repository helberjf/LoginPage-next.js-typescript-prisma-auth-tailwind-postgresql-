"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ServiceModal from "@/components/admin/ServiceModal";

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

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const load = async (q = "") => {
    try {
      setIsSearching(true);
      const params = new URLSearchParams();
      if (q) params.append("q", q);

      const url = `/api/admin/services${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setServices([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      load(search);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este serviço?")) return;

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erro ao deletar");

      setServices(services.filter((s) => s.id !== id));
      alert("Serviço deletado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar serviço");
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          active: !service.active,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      setServices(
        services.map((s) =>
          s.id === service.id ? { ...s, active: !s.active } : s
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar serviço");
    }
  };

  function formatBRL(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return <div className="p-4">Carregando serviços...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar serviços..."
          className="border rounded px-3 py-2 w-1/3"
        />
        <button
          onClick={() => {
            setEditingService(null);
            setCreationModalOpen(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Novo Serviço
        </button>
      </div>

      {isSearching && <div className="text-center text-gray-500">Buscando...</div>}

      {services.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nenhum serviço encontrado</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left px-4 py-2">Imagem</th>
                <th className="text-left px-4 py-2">Nome</th>
                <th className="text-left px-4 py-2">Duração</th>
                <th className="text-left px-4 py-2">Preço</th>
                <th className="text-center px-4 py-2">Ativo</th>
                <th className="text-center px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => {
                const mainImage = service.images?.[0];
                return (
                  <tr key={service.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {mainImage ? (
                        <Image
                          src={mainImage.url}
                          alt={service.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          Sem imagem
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600 truncate">
                          {service.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">{service.durationMins} min</td>
                    <td className="px-4 py-2">{formatBRL(service.priceCents)}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`px-3 py-1 rounded text-white text-sm ${
                          service.active
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-400 hover:bg-gray-500"
                        }`}
                      >
                        {service.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setCreationModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creationModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setCreationModalOpen(false);
            setEditingService(null);
          }}
          onSuccess={() => {
            setCreationModalOpen(false);
            setEditingService(null);
            load(search);
          }}
        />
      )}
    </div>
  );
}
