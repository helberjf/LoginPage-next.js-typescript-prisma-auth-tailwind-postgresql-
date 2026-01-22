"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Search, Clock, DollarSign, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  durationMins: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  images: Array<{ url: string; position: number }>;
};

type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
};

export default function ServicesPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceFilterOpen, setPriceFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Fetch services e categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/categories/service"),
        ]);

        const servicesData = await servicesRes.json();
        const categoriesData = await categoriesRes.json();

        setServices(Array.isArray(servicesData) ? servicesData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error("Failed to load services or categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtragem de serviços
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(service.categoryId);

      const matchesPrice =
        service.priceCents >= priceRange[0] * 100 &&
        service.priceCents <= priceRange[1] * 100;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [services, searchTerm, selectedCategories, priceRange]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    setSelectedCategories(value ? [value] : []);
  };

  const maxPrice = useMemo(() => {
    if (services.length === 0) return 10000;
    return Math.max(...services.map((s) => s.priceCents)) / 100;
  }, [services]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* HEADER MOBILE-FIRST */}
      <div className="sticky top-14 md:top-14 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        {/* Barra de Busca */}
        <div className="p-3 md:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center max-w-7xl mx-auto">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setPriceFilterOpen(!priceFilterOpen)}
                  aria-label="Filtrar por preço"
                  className="h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Preço</span>
                </button>

                {priceFilterOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 shadow-lg z-20">
                    <label className="text-xs font-semibold block mb-2 text-neutral-600 dark:text-neutral-300">
                      Até R$ {priceRange[1]}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm px-3 py-2"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex max-w-7xl mx-auto">
        {/* FILTROS DESKTOP (Sidebar) */}
        <aside className="hidden md:block w-64 border-r border-neutral-200 dark:border-neutral-800 p-4 sticky top-32 h-fit max-h-[calc(100vh-8rem)]">
          <h2 className="font-bold text-lg mb-4">Filtrar</h2>

          {/* Categorias */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">Categorias</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preço */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Faixa de Preço</h3>
            <div className="space-y-2">
              <label className="text-sm text-neutral-600 dark:text-neutral-400">
                Até R$ {priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full"
              />
            </div>
          </div>
        </aside>

        {/* GRID DE SERVIÇOS */}
        <main className="flex-1 p-3 md:p-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
              <Search className="w-12 h-12 text-neutral-300" />
              <p className="text-neutral-500">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {filteredServices.length} serviços encontrados
              </p>

              {/* Mercado Livre style: list on mobile, grid on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filteredServices.map((service) => {
                  const image = service.images?.[0];
                  const price = (service.priceCents / 100).toFixed(2);

                  return (
                    <div
                      key={service.id}
                      className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-row md:flex-col">
                        {/* Imagem */}
                        <div className="relative w-24 min-w-24 h-24 md:w-full md:h-40 bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={service.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <DollarSign className="w-10 h-10 text-neutral-400" />
                            </div>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 p-3 md:p-4 space-y-2">
                          {/* Categoria */}
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{service.category?.name ?? "Serviço"}</span>
                          </div>

                          {/* Nome */}
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-blue-600">
                            {service.name}
                          </h3>

                          {/* Descrição */}
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {service.description}
                          </p>

                          {/* Informações */}
                          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{service.durationMins}min</span>
                            </div>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              R$ {price}
                            </span>
                          </div>

                          {/* Ações */}
                          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="mt-2 flex items-center gap-2">
                              <Link
                                href={`/schedules?serviceId=${service.id}`}
                                className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                              >
                                Agendar agora
                              </Link>
                              <Link
                                href={`/services/${service.id}`}
                                className="inline-flex items-center justify-center text-xs font-semibold text-green-600 underline hover:text-green-700"
                              >
                                Ver detalhes
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
