// components/products/ProductCard.tsx
"use client";

import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

type Product = {
  id: string;
  name: string;
  priceCents: number;

  salesCount?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;

  discountPercent?: number | null;
  hasFreeShipping?: boolean;

  category?: {
    slug: string;
    name: string;
  };

  images?: {
    url: string;
    position?: number;
  }[];
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addItem } = useCart();

  const mainImage =
    product.images?.find(img => img.position === 0)?.url ??
    product.images?.[0]?.url ??
    "/placeholder.png";

  const basePrice = product.priceCents;

  const finalPrice =
    product.discountPercent && product.discountPercent > 0
      ? Math.round(basePrice * (1 - product.discountPercent / 100))
      : basePrice;

  // Verifica se é um serviço/agendamento
  const isServiceSchedule = product.category?.slug === "atendimento";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isServiceSchedule) {
      addItem({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        image: mainImage,
        discountPercent: product.discountPercent,
      });
    }
  }

  return (
    <article className="border rounded-md bg-white dark:bg-neutral-900 overflow-hidden relative group">
      {/* IMAGE — QUADRADA, PADRÃO ML */}
      <div className="aspect-square bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        
        {/* Botão + para adicionar ao carrinho OU ícone de calendário */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`absolute bottom-2 right-2 ${
            isServiceSchedule 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-full p-2.5 shadow-lg transition opacity-0 group-hover:opacity-100`}
          title={isServiceSchedule ? "Agendar serviço" : "Adicionar ao carrinho"}
        >
          {isServiceSchedule ? <Calendar size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* INFO */}
      <div className="p-2 space-y-1">
        <div className="text-xs line-clamp-2 text-neutral-800 dark:text-neutral-100">
          {product.name}
        </div>

        <div className="text-[11px] text-neutral-500">
          ⭐ {(product.ratingAverage ?? 0).toFixed(1)} • {product.salesCount ?? 0} {isServiceSchedule ? "atendimentos" : "vendidos"}
        </div>

        <div className="text-sm font-semibold">
          R$ {(finalPrice / 100).toFixed(2)}
        </div>

        {/* Badges em linha - sempre na mesma altura */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[16px]">
          {product.discountPercent && (
            <div className="text-[11px] text-green-600 font-medium">
              {product.discountPercent}% OFF
            </div>
          )}
          {product.hasFreeShipping && !isServiceSchedule && (
            <div className="text-[11px] text-green-600 font-medium">
              Frete grátis
            </div>
          )}
        </div>

        <Link
          href={`/products/${product.id}`}
          className={`block mt-1 text-center text-[11px] py-1 rounded text-white ${
            isServiceSchedule
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isServiceSchedule ? "Agendar" : "Comprar"}
        </Link>
      </div>
    </article>
  );
}