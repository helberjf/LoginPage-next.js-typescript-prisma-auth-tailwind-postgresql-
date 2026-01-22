"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ServiceImageInput = { url: string; position: number };

type Category = {
  id: string;
  name: string;
};

type Props = {
  serviceId?: string;
  onSuccess?: () => void;
};

function formatBRL(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function parseMoneyToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export default function ServiceForm({ serviceId, onSuccess }: Props) {
  const router = useRouter();
  const isEdit = Boolean(serviceId);

  const [active, setActive] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [durationMins, setDurationMins] = useState("30");
  const [price, setPrice] = useState("0,00");

  const [images, setImages] = useState<ServiceImageInput[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load service");
      const data = await res.json();

      setName(data.name || "");
      setDescription(data.description || "");
      setCategoryId(data.categoryId || "");
      setDurationMins(String(data.durationMins || 30));
      setPrice(formatBRL(data.priceCents || 0));
      setActive(data.active ?? true);
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar serviço");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (!isEdit) return;
    void load();
  }, [isEdit, load]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories/service", {
          credentials: "include",
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar categorias de serviço", err);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/services", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload falhou");
      }

      const data = await res.json();
      const newImage: ServiceImageInput = {
        url: data.url,
        position: images.length,
      };
      setImages([...images, newImage]);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      setError("URL da imagem não pode estar vazia");
      return;
    }

    try {
      // Validar URL
      new URL(imageUrl);
      
      const newImage: ServiceImageInput = {
        url: imageUrl,
        position: images.length,
      };
      setImages([...images, newImage]);
      setImageUrl("");
      setError("");
    } catch {
      setError("URL inválida. Deve começar com http:// ou https://");
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }

    const newImages = [...images];
    const [movedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, movedImage);

    const reordered = newImages.map((img, i) => ({
      ...img,
      position: i,
    }));

    setImages(reordered);
    setDragIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!categoryId) {
      setError("Categoria é obrigatória");
      return;
    }

    if (!durationMins || isNaN(Number(durationMins)) || Number(durationMins) <= 0) {
      setError("Duração deve ser um número positivo");
      return;
    }

    try {
      setSaveLoading(true);
      setError("");
      setSuccess("");

      const priceCents = parseMoneyToCents(price);
      if (priceCents === null) {
        setError("Preço inválido");
        return;
      }

      const payload = {
        name,
        description,
        categoryId,
        durationMins: Number(durationMins),
        priceCents,
        active,
        images,
      };

      const url = isEdit ? `/api/admin/services/${serviceId}` : "/api/admin/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erro ao salvar serviço");

      setSuccess(isEdit ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!");
      setTimeout(() => {
        onSuccess?.();
        router.push("/dashboard/admin/services");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar serviço");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}

      <div>
        <label className="block text-sm font-medium mb-2">Nome *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Nome do serviço"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Descrição do serviço"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Categoria *</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white"
          disabled={loadingCategories}
        >
          <option value="">
            {loadingCategories ? "Carregando categorias..." : "Selecione uma categoria"}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Duração (minutos) *</label>
          <input
            type="number"
            value={durationMins}
            onChange={(e) => setDurationMins(e.target.value)}
            className="w-full border rounded px-3 py-2"
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Preço (R$)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="0,00"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Ativo</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Imagens</label>
        <div className="mb-4 space-y-3">
          <div>
            <label className="block border-2 border-dashed rounded p-4 text-center cursor-pointer hover:border-blue-500">
              <span className="text-sm">Clique para fazer upload de imagem</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAddImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Ou cole a URL de uma imagem..."
              className="flex-1 border rounded px-3 py-2"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Adicionar
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx)}
                className="relative border rounded overflow-hidden"
              >
                <div className="relative w-full h-32">
                  <Image
                    src={img.url}
                    alt={`Service ${idx}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saveLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {saveLoading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/admin/services")}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
