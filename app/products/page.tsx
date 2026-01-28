// app/products/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import ProductCard from "@/components/products/ProductCard";
import ProductCategoryFilter from "@/components/products/ProductCategoryFilter";
import ProductPriceFilter from "@/components/products/ProductPriceFilter";
import SearchBar from "@/components/SearchBar";
import { Suspense } from "react";
import { Calendar } from "lucide-react";

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const normalizeR2Url = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (R2_PUBLIC_URL && trimmed.includes("r2.cloudflarestorage.com")) {
    try {
      const parsed = new URL(trimmed);
      let path = parsed.pathname;
      if (R2_BUCKET_NAME && path.startsWith(`/${R2_BUCKET_NAME}/`)) {
        path = path.replace(`/${R2_BUCKET_NAME}`, "");
      }
      return `${R2_PUBLIC_URL}${path}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

async function ProductsContent({
  searchQuery,
  categorySlug,
  maxPrice,
}: {
  searchQuery?: string;
  categorySlug?: string;
  maxPrice?: number;
}) {
  const categories = await prisma.category.findMany({
    where: { active: true, deletedAt: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  const priceAggregate = await prisma.product.aggregate({
    where: {
      active: true,
      stock: { gt: 0 },
      deletedAt: null,
    },
    _max: { priceCents: true },
  });

  const maxProductPrice = Math.max(
    1,
    Math.ceil((priceAggregate._max.priceCents ?? 10000 * 100) / 100)
  );

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">Produtos</h1>
              <p className="text-neutral-500">
                Veja, compare e escolha o melhor produto para você
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center gap-2">
                <SearchBar />
                <ProductPriceFilter maxPrice={maxProductPrice} />
              </div>
              <ProductCategoryFilter categories={categories} />
            </div>
          </div>

          {/* Ações globais */}
          <Suspense fallback={<div>Carregando...</div>}>
            <GlobalActions />
          </Suspense>
        </header>

        {/* Produtos */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-8">
          <Suspense fallback={<div>Carregando produtos...</div>}>
            <ProductGrid
              searchQuery={searchQuery}
              categorySlug={categorySlug}
              maxPrice={maxPrice}
            />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

async function GlobalActions() {
  const session = await auth();
  const isLogged = !!session?.user;

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/schedules"
        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm flex items-center gap-2 transition"
      >
        <Calendar className="h-4 w-4" />
        Agendar Serviços
      </Link>

      {isLogged ? null : (
        <>
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
          >
            Criar conta
          </Link>
        </>
      )}

      <Link
        href="/"
        className="px-4 py-2 rounded-md text-sm text-neutral-600 hover:underline"
      >
        Voltar para Home
      </Link>
    </div>
  );
}

async function ProductGrid({
  searchQuery,
  categorySlug,
  maxPrice,
}: {
  searchQuery?: string;
  categorySlug?: string;
  maxPrice?: number;
}) {
  const session = await auth();
  const isLogged = !!session?.user;

  // Construir where clause baseado na busca
  const whereClause: any = {
    active: true,
    stock: {
      gt: 0,
    },
    deletedAt: null,
  };

  // Se houver query de busca, adicionar filtro por nome (ignorando acentos)
  if (searchQuery && searchQuery.trim()) {
    whereClause.OR = [
      {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: searchQuery
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""), // Remove acentos
          mode: "insensitive",
        },
      },
    ];
  }

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  if (typeof maxPrice === "number" && Number.isFinite(maxPrice)) {
    whereClause.priceCents = {
      lte: Math.round(maxPrice * 100),
    };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      priceCents: true,
      discountPercent: true,
      hasFreeShipping: true,
      images: {
        where: { position: 0 },
        select: { path: true, storage: true, position: true },
      },
      salesCount: true,
      ratingAverage: true,
      ratingCount: true,
    },
  });

  const productsWithUrls = products.map((product) => ({
    ...product,
    images: product.images.map((img) => {
      const normalizedPath = normalizeR2Url(img.path);
      return {
        url:
          img.storage === "R2" || normalizedPath.startsWith("http")
            ? normalizedPath
            : normalizedPath.startsWith("/uploads/")
            ? normalizedPath
            : `/uploads/${normalizedPath}`,
        position: img.position,
      };
    }),
  }));

  if (productsWithUrls.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-neutral-500">
          {searchQuery
            ? `Nenhum produto encontrado para "${searchQuery}"`
            : "Nenhum produto encontrado"}
        </p>
      </div>
    );
  }

  return productsWithUrls.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
    />
  ));
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : undefined;

  return (
    <ProductsContent
      searchQuery={params?.q}
      categorySlug={params?.category}
      maxPrice={Number.isFinite(maxPrice) ? maxPrice : undefined}
    />
  );
}