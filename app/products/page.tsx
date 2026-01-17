// app/products/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import ProductCard from "@/components/products/ProductCard";
import SearchBar from "@/components/SearchBar";
import { Suspense } from "react";

function ProductsContent({ searchQuery }: { searchQuery?: string }) {
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
            
            <SearchBar />
          </div>

          {/* Ações globais para visitante */}
          <Suspense fallback={<div>Carregando...</div>}>
            <SearchActions />
          </Suspense>
        </header>

        {/* Produtos */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-8">
          <Suspense fallback={<div>Carregando produtos...</div>}>
            <ProductGrid searchQuery={searchQuery} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

async function SearchActions() {
  const session = await auth();
  const isLogged = !!session?.user;

  if (isLogged) return null;

  return (
    <div className="flex flex-wrap gap-3">
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

      <Link
        href="/"
        className="px-4 py-2 rounded-md text-sm text-neutral-600 hover:underline"
      >
        Voltar para Home
      </Link>
    </div>
  );
}

async function ProductGrid({ searchQuery }: { searchQuery?: string }) {
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
        select: { url: true },
      },
      salesCount: true,
      ratingAverage: true,
      ratingCount: true,
    },
  });

  if (products.length === 0) {
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

  return products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      isLogged={isLogged}
    />
  ));
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  return (
    <ProductsContent searchQuery={searchParams?.q} />
  );
}
