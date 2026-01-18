"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ImageGalleryProps = {
  images: { url: string; position?: number }[];
  productName: string;
};

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageList = images.length > 0 ? images : [{ url: "/placeholder.png", position: 0 }];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const currentImage = imageList[currentIndex];

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Main Image com Setas - Menor em mobile */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-2 sm:p-3 md:p-4 group">
        <div className="aspect-square max-w-[280px] sm:max-w-none mx-auto bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.url}
            alt={productName}
            className="w-full h-full object-contain"
            loading="lazy"
          />

          {/* Setas de Navegação */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg transition opacity-0 group-hover:opacity-100"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg transition opacity-0 group-hover:opacity-100"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Indicador de posição */}
          {imageList.length > 1 && (
            <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-1.5 py-0.5 sm:px-2 rounded-full text-[9px] sm:text-[10px] md:text-xs">
              {currentIndex + 1} / {imageList.length}
            </div>
          )}
        </div>

        {/* Nome do produto abaixo da imagem */}
        <div className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-medium text-neutral-800 dark:text-neutral-200 text-center line-clamp-2">
          {productName}
        </div>
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded border-2 overflow-hidden transition ${
                idx === currentIndex
                  ? "border-blue-500"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}