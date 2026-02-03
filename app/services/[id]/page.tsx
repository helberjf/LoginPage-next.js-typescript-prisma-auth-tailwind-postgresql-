"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Clock,
  DollarSign,
  Star,
  ChevronLeft,
  Share2,
  Heart,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ServiceImage = {
  id: string;
  url: string;
  position: number;
};

type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  durationMins: number;
  category: ServiceCategory;
  images: ServiceImage[];
  ratingAverage: number;
  ratingCount: number;
};

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();
        setService(data);
      } catch (err) {
        console.error("Failed to load service:", err);
        setError("Serviço não encontrado");
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    );

  if (error || !service)
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col items-center justify-center gap-3">
        <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    );

  const mainImage = service.images[selectedImageIndex];
  const price = (service.priceCents / 100).toFixed(2);

  const handleBookService = () => {
    if (!session?.user) {
      setAuthModalOpen(true);
      return;
    }
    setIsBooking(true);
    // Redirect to booking flow
    router.push(`/schedules?serviceId=${service.id}`);
  };

  const loginUrl = `/login?redirect=${encodeURIComponent(`/services/${service.id}`)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(`/services/${service.id}`)}`;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* HEADER MOBILE */}
      <div className="sticky top-14 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-3 md:hidden flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 font-semibold truncate">{service.name}</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* GALERIA - MOBILE FIRST */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 md:p-6">
          {/* Imagem Principal */}
          <div className="md:col-span-3">
            <div className="relative w-full aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={service.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DollarSign className="w-16 h-16 text-neutral-400" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {service.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {service.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition",
                      idx === selectedImageIndex
                        ? "border-blue-600"
                        : "border-neutral-200 dark:border-neutral-700"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={`${service.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO PAINEL - DESKTOP */}
          <div className="hidden md:flex md:col-span-2 flex-col gap-4">
            {/* Categoria */}
            <span className="text-sm text-blue-600 font-semibold">
              {service.category.name}
            </span>

            {/* Título */}
            <h1 className="text-2xl font-bold">{service.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.round(service.ratingAverage)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-neutral-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-600">
                {service.ratingAverage.toFixed(1)} ({service.ratingCount}{" "}
                avaliações)
              </span>
            </div>

            {/* Preço */}
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Preço do Serviço
              </p>
              <p className="text-3xl font-bold text-blue-600">R$ {price}</p>
            </div>

            {/* Informações Rápidas */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span>{service.durationMins} minutos</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <button
              onClick={handleBookService}
              disabled={isBooking}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Agendar Serviço
            </button>

            <button className="w-full border border-neutral-300 dark:border-neutral-700 py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Favoritar
            </button>

            <button className="w-full border border-neutral-300 dark:border-neutral-700 py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* DETALHES - MOBILE */}
        <div className="md:hidden p-3 space-y-4 border-t border-neutral-200 dark:border-neutral-800">
          {/* Categoria */}
          <span className="text-sm text-blue-600 font-semibold block">
            {service.category.name}
          </span>

          {/* Preço */}
          <div>

          <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Faça login para agendar</DialogTitle>
                <DialogDescription>
                  Para agendar um serviço, é necessário entrar ou criar uma conta.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Link
                  href={registerUrl}
                  className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800/60"
                >
                  Criar conta
                </Link>
                <Link
                  href={loginUrl}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Entrar
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            <p className="text-sm text-neutral-600">Preço</p>
            <p className="text-3xl font-bold text-blue-600">R$ {price}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.round(service.ratingAverage)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-neutral-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-neutral-600">
              {service.ratingAverage.toFixed(1)} ({service.ratingCount})
            </span>
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>Duração: {service.durationMins} minutos</span>
          </div>

          {/* Botão Mobile */}
          <button
            onClick={handleBookService}
            disabled={isBooking}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Agendar Agora
          </button>
        </div>

        {/* DESCRIÇÃO */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 md:p-6">
          <h2 className="text-xl font-bold mb-3">Sobre o Serviço</h2>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {service.description}
          </p>
        </div>
      </div>

      {/* FIXED BOTTOM - MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-3 flex gap-2">
        <button className="flex-1 border border-neutral-300 dark:border-neutral-700 py-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <Heart className="w-5 h-5 mx-auto" />
        </button>
        <button
          onClick={handleBookService}
          disabled={isBooking}
          className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Agendar
        </button>
      </div>

      {/* Espaço para fixed button mobile */}
      <div className="md:hidden h-16" />
    </div>
  );
}
