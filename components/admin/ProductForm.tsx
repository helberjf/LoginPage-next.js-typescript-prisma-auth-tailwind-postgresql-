// components/admin/ProductForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductImageInput = { url: string; position: number };

type Category = {
  id: string;
  name: string;
};

type Props = {
  productId?: string;
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

export default function ProductForm({ productId, onSuccess }: Props) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [active, setActive] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [price, setPrice] = useState("0,00");
  const [stock, setStock] = useState("0");

  const [discountPercent, setDiscountPercent] = useState("");
  const [hasFreeShipping, setHasFreeShipping] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const [images, setImages] = useState<ProductImageInput[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  const priceCents = useMemo(() => parseMoneyToCents(price), [price]);

  const computedFinalCents = useMemo(() => {
    if (priceCents == null) return null;
    const d = discountPercent.trim() ? Number(discountPercent) : 0;
    if (Number.isNaN(d) || d <= 0) return priceCents;
    return Math.round(priceCents * (1 - d / 100));
  }, [priceCents, discountPercent]);

  /* ===== Load categories ===== */
  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/categories", { credentials: "include" });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  /* ===== Load product (edit) ===== */
  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setLoadingProduct(true);
        const res = await fetch(`/api/admin/products?id=${productId}`, {
          credentials: "include",
        });
        const p = await res.json();

        setActive(Boolean(p.active));
        setName(p.name ?? "");
        setDescription(p.description ?? "");
        setCategoryId(p.categoryId ?? "");
        setPrice(formatBRL(Number(p.priceCents ?? 0)));
        setStock(String(p.stock ?? 0));

        setDiscountPercent(p.discountPercent == null ? "" : String(p.discountPercent));
        setHasFreeShipping(Boolean(p.hasFreeShipping));
        setCouponCode(p.couponCode ?? "");

        const imgs: ProductImageInput[] = Array.isArray(p.images)
          ? p.images
              .slice()
              .sort((a: ProductImageInput, b: ProductImageInput) => (a.position ?? 0) - (b.position ?? 0))
              .map((img: ProductImageInput) => ({
                url: String(img.url ?? ""),
                position: Number(img.position ?? 0),
              }))
          : [];

        setImages(imgs);
      } catch {
        setError("Falha ao carregar produto.");
      } finally {
        setLoadingProduct(false);
      }
    })();
  }, [productId]);

  /* ===== Upload (1 file per request) ===== */
  const uploadCover = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/uploads/product-image", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Falha no upload.");
      }

      const url = data?.url as string;

      setImages((prev) => {
        // evita duplicada
        if (prev.some((p) => p.url === url)) return prev;

        const next = [...prev, { url, position: prev.length }];
        return next.map((img, i) => ({ ...img, position: i }));
      });
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Falha no upload.");
    } finally {
      setUploading(false);
    }
  };

  /* ===== Add URL ===== */
  const addImageByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;

    setImages((prev) => {
      if (prev.some((p) => p.url === url)) return prev;

      const next = [...prev, { url, position: prev.length }];
      return next.map((img, i) => ({ ...img, position: i }));
    });

    setUrlInput("");
  };

  /* ===== Reorder ===== */
  const reorderImages = (from: number, to: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);

      return copy.map((img, i) => ({ ...img, position: i }));
    });

    setDragIndex(null);
  };

  /* ===== Remove ===== */
  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, position: i }));
      return next;
    });
  };

  /* ===== Submit ===== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Título é obrigatório.");
    if (!description.trim()) return setError("Descrição é obrigatória.");
    if (!categoryId) return setError("Categoria é obrigatória.");
    if (priceCents == null || priceCents <= 0) return setError("Preço inválido.");

    setSaving(true);

    const payload = {
      id: productId,
      name: name.trim(),
      description: description.trim(),
      categoryId,
      priceCents: priceCents!,
      stock: parseInt(stock, 10) || 0,
      active,
      discountPercent: discountPercent.trim() ? parseInt(discountPercent, 10) : null,
      hasFreeShipping,
      couponCode: couponCode.trim() ? couponCode.trim().toUpperCase() : null,
      images: images.map((img, i) => ({ url: img.url, position: i })),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Falha ao salvar produto.");
        return;
      }

      if (onSuccess) onSuccess();
      else router.push("/dashboard/admin/products");
    } catch {
      setError("Falha ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return <div className="text-sm text-neutral-500">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{isEdit ? "Editar produto" : "Novo produto"}</span>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Ativo
        </label>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs mb-1">Título</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Descrição</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs mb-1">Categoria *</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loadingCategories}
          >
            <option value="">{loadingCategories ? "Carregando..." : "Selecione uma categoria"}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs mb-1">Preço</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Estoque</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Desconto %</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Cupom (opcional)</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm uppercase"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="OFERTA10"
          />
        </div>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={hasFreeShipping}
            onChange={(e) => setHasFreeShipping(e.target.checked)}
          />
          Frete grátis
        </label>
      </div>

      {/* Fotos */}
      <div className="border rounded-md p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold">Fotos (opcional)</span>

          <label className="inline-block text-xs px-3 py-2 border rounded cursor-pointer">
            {uploading ? "Enviando..." : "Selecionar imagens"}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                files.forEach(uploadCover);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        {/* URL input sempre visível */}
        <div className="flex gap-2">
          <input
            className="w-full border rounded-md px-3 py-2 text-xs"
            placeholder="Cole uma URL de imagem (opcional)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button
            type="button"
            onClick={addImageByUrl}
            className="px-3 py-2 border rounded text-xs"
          >
            Add URL
          </button>
        </div>

        {/* Preview só se tiver imagens */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2">
            {images.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragIndex !== null && reorderImages(dragIndex, i)}
                className="border rounded p-1 cursor-move"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Imagem ${i + 1}`}
                  className="h-24 w-full object-contain"
                />

                {i === 0 && (
                  <div className="text-[10px] text-center text-indigo-600">
                    CAPA
                  </div>
                )}

                <button
                  type="button"
                  className="text-xs text-red-600 w-full"
                  onClick={() => removeImage(i)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-xs">
          Preço final:{" "}
          <strong>
            {computedFinalCents != null ? `R$ ${formatBRL(computedFinalCents)}` : "-"}
          </strong>
        </span>

        <button
          type="submit"
          disabled={saving || uploading}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-60"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar" : "Publicar"}
        </button>
      </div>
    </form>
  );
}
