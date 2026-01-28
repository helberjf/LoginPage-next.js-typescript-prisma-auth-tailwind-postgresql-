"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { toast } from "sonner";
import { redirect } from "next/dist/server/api-utils";

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

const PLACEHOLDER_IMAGE = "/images/placeholder/iphone17ProMax.webp";

function normalizeImageUrl(url?: string | null) {
  if (!url) return PLACEHOLDER_IMAGE;
  const trimmed = url.trim();
  if (!trimmed) return PLACEHOLDER_IMAGE;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? product.images
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((img) => ({ ...img, url: normalizeImageUrl(img.url) }))
    : [{ url: PLACEHOLDER_IMAGE, position: 0 }];

  const currentImage = images[currentImageIndex]?.url ?? PLACEHOLDER_IMAGE;
  const hasMultipleImages = images.length > 1;

  const basePrice = product.priceCents;
  const finalPrice =
    product.discountPercent && product.discountPercent > 0
      ? Math.round(basePrice * (1 - product.discountPercent / 100))
      : basePrice;

  const isServiceSchedule = product.category?.slug === "atendimento";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isServiceSchedule) {
      addItem({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        image: currentImage,
        discountPercent: product.discountPercent,
        type: "PRODUCT", // Adicionar tipo
      });
      toast.success(`${product.name} adicionado ao carrinho!`, {
        description: "Continue comprando ou finalize seu pedido.",
        action: {
          label: "Ver carrinho",
          onClick: () => {
            redirect("/checkout");
          },
        },
      });
    }
  }

  function handlePreviousImage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function handleNextImage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <article className="border rounded-md bg-white dark:bg-neutral-900 overflow-hidden relative group">
      {/* IMAGE — QUADRADA, PADRÃO ML */}
      <div className="aspect-square bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        
        {/* Navegação de imagens */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePreviousImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full p-1 shadow-md transition opacity-0 group-hover:opacity-100"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full p-1 shadow-md transition opacity-0 group-hover:opacity-100"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={14} />
            </button>

            {/* Indicador de posição */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white px-1.5 py-0.5 rounded-full text-[9px] opacity-0 group-hover:opacity-100 transition">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}
        
        {/* Botão + para adicionar ao carrinho OU ícone de calendário */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`absolute bottom-2 right-2 ${
            isServiceSchedule 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-full p-2.5 shadow-lg transition sm:group-hover:opacity-100`}
          title={isServiceSchedule ? "Agendar serviço" : "Adicionar ao carrinho"}
        >
          {isServiceSchedule ? <Calendar size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {/* INFO */}
      <div className="p-2 space-y-1">
        <h3 className="text-xs line-clamp-2 text-neutral-800 dark:text-neutral-100 font-medium">
          {product.name}
        </h3>

        <div className="text-[11px] text-neutral-500">
          ⭐ {(product.ratingAverage ?? 0).toFixed(1)} • {product.salesCount ?? 0} {isServiceSchedule ? "atendimentos" : "vendidos"}
        </div>

        <div className="text-sm font-semibold">
          R$ {(finalPrice / 100).toFixed(2)}
        </div>

        {/* Badges em linha - sempre na mesma altura */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-4">
          {product.discountPercent && (
            <span className="text-[11px] text-green-600 font-medium">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.hasFreeShipping && !isServiceSchedule && (
            <span className="text-[11px] text-green-600 font-medium">
              Frete grátis
            </span>
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