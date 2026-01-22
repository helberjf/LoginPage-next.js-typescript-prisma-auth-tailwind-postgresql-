"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { toast } from "sonner";

type Service = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number | null;
  durationMins: number;
  ratingAverage?: number;
  ratingCount?: number;
  category?: {
    slug: string;
    name: string;
  };
  images?: {
    url: string;
    position?: number;
  }[];
};

type ServiceCardProps = {
  service: Service;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = service.images && service.images.length > 0 
    ? service.images.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    : [{ url: "/images/placeholder/iphone17ProMax.webp", position: 0 }];

  const currentImage = images[currentImageIndex]?.url ?? "/images/placeholder/iphone17ProMax.webp";
  const hasMultipleImages = images.length > 1;

  const price = service.priceCents ?? 0;
  const isFree = price === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: service.id,
      name: service.name,
      priceCents: price,
      image: currentImage,
      type: "SERVICE",
      durationMins: service.durationMins,
    });
    
    toast.success(`${service.name} adicionado ao carrinho!`, {
      description: "Continue navegando ou finalize seu agendamento.",
      action: {
        label: "Ver carrinho",
        onClick: () => {
          window.location.href = "/checkout";
        },
      },
    });
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
    <Link
      href={`/services/${service.id}`}
      className="group block bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Imagem com navegação */}
      <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <Image
          src={currentImage}
          alt={service.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Navegação de imagens */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePreviousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-neutral-800/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-700"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-neutral-800/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-700"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicadores de imagem */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? "bg-white w-3"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge de categoria */}
        {service.category && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-blue-600 text-white text-xs font-medium">
            {service.category.name}
          </div>
        )}

        {/* Badge Grátis */}
        {isFree && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-green-600 text-white text-xs font-bold">
            GRÁTIS
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-3 space-y-2">
        {/* Nome do serviço */}
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors min-h-10">
          {service.name}
        </h3>

        {/* Duração */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{service.durationMins} minutos</span>
        </div>

        {/* Preço e botão */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div>
            {isFree ? (
              <p className="text-lg font-bold text-green-600">Gratuito</p>
            ) : (
              <p className="text-lg font-bold text-blue-600">
                R$ {(price / 100).toFixed(2)}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Rating (se disponível) */}
        {service.ratingCount && service.ratingCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">
              {service.ratingAverage?.toFixed(1)}
            </span>
            <span>({service.ratingCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
