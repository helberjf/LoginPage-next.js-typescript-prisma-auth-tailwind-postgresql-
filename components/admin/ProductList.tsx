// components/admin/ProductList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductModal from "@/components/admin/ProductModal";
import { removeAccents } from "@/lib/utils/utils";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  active: boolean;

  salesCount?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;

  discountPercent?: number | null;
  hasFreeShipping: boolean;
  couponCode?: string | null;

  images?: {
    url: string;
    position: number;
  }[];
};

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");

const normalizeR2Url = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (R2_PUBLIC_URL && trimmed.includes("r2.cloudflarestorage.com")) {
    try {
      const parsed = new URL(trimmed);
      const path = parsed.pathname.replace(/^\/[^/]+/, "");
      return `${R2_PUBLIC_URL}${path}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);


  const load = async (q = "") => {
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (categoryId) params.append("categoryId", categoryId);

      const url = `/api/admin/products${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((p: Product) => ({
            ...p,
            images: Array.isArray(p.images)
              ? p.images.map((img) => ({
                  ...img,
                  url: normalizeR2Url(String(img.url ?? "")),
                }))
              : [],
          }))
        : [];
      setProducts(normalized);
    } catch (e) {
      console.error(e);
      setProducts([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, categoryId]);

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

  useEffect(() => {
    if (!search.trim()) {
      load();
      return;
    }

    setIsSearching(true);
    const t = setTimeout(() => load(removeAccents(search.trim())), 300);
    return () => clearTimeout(t);
  }, [search]);

  if (loading) {
    return <div className="text-center py-8">Carregando produtos…</div>;
  }

  return (
    <div className="space-y-6">
      {/* ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
        <input
          placeholder="Buscar produtos…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:max-w-sm"
        />

        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="border px-3 py-2 rounded w-full md:max-w-sm text-neutral-900 dark:text-neutral-100"
          disabled={loadingCategories}
        >
          <option value="">{loadingCategories ? "Carregando categorias..." : "Todas as categorias"}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setCreationModalOpen(true);
            setEditingProduct(null);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Novo produto
        </button>
      </div>

      {isSearching && (
        <div className="text-sm text-neutral-500">
          Buscando…
        </div>
      )}

      {/* GRID */}
      {products.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          Nenhum produto encontrado
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => {
            const mainImageRaw =
              p.images?.find(img => img.position === 0)?.url ?? null;
            const mainImage = mainImageRaw ? normalizeR2Url(mainImageRaw) : null;

            const priceCents = p.priceCents ?? 0;

            const finalPrice =
              p.discountPercent && p.discountPercent > 0
                ? Math.round(priceCents * (1 - p.discountPercent / 100))
                : priceCents;

            const sales = p.salesCount ?? 0;
            const ratingAvg = p.ratingAverage ?? 0;
            const ratingCount = p.ratingCount ?? 0;

            return (
              <div
                key={p.id}
                className="border rounded-lg bg-white dark:bg-neutral-900 overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative w-full aspect-square overflow-hidden bg-neutral-100">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={p.name}
                      fill={true}
                      sizes="(min-width: 768px) 25vw, 50vw"
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                      Sem imagem
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-3 space-y-2">
                  <div className="text-sm line-clamp-2">
                    {p.name}
                  </div>

                  <div className="text-xs text-neutral-500">
                    {sales} vendidos • ⭐ {ratingAvg.toFixed(1)} ({ratingCount})
                  </div>

                  <div className="text-base font-semibold">
                    R$ {(finalPrice / 100).toFixed(2)}
                    {p.discountPercent && p.discountPercent > 0 && (
                      <span className="text-xs text-green-600 ml-1">
                        {p.discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {p.couponCode && (
                    <div className="text-xs text-indigo-600">
                      Cupom: {p.couponCode}
                    </div>
                  )}

                  {p.hasFreeShipping && (
                    <div className="text-xs text-green-600">
                      Frete grátis
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setCreationModalOpen(true);
                      }}
                      className="flex-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded text-center hover:bg-indigo-700 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Tem certeza que deseja deletar este produto?")) return;
                        try {
                          const res = await fetch(`/api/admin/products?id=${p.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          });
                          if (res.ok) {
                            load(search.trim());
                          }
                        } catch (e) {
                          console.error("Erro ao deletar:", e);
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      <ProductModal
        open={creationModalOpen || !!editingProduct}
        onClose={() => {
          setCreationModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onCreated={() => load(search.trim())}
        onUpdated={() => load(search.trim())}
      />
    </div>
  );
}
