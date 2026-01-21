import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";
import ProductCard from "@/components/products/ProductCard";
import SearchBar from "@/components/SearchBar";
import { Suspense } from "react";
import type { Metadata } from "next";

type SearchParams = Promise<{ q?: string; categoryId?: string }> | { q?: string; categoryId?: string };

type PageProps = {
  searchParams: SearchParams;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await Promise.resolve(searchParams);
  const query = params?.q;
  
  return {
    title: query ? `${query} - Produtos` : "Produtos - Sistema de E-commerce",
    description: query 
      ? `Encontre ${query} e outros produtos com os melhores preços e frete grátis`
      : "Navegue por nosso catálogo completo de produtos com os melhores preços, frete grátis e entregas rápidas",
    openGraph: {
      title: query ? `${query} - Produtos` : "Produtos",
      description: "Encontre os melhores produtos com preços especiais",
    },
  };
}

type Category = {
  id: string;
  name: string;
  slug: string;
};

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

function ProductsHeader() {
  return (
    <header className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            Produtos
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">
            Veja, compare e escolha o melhor produto para você
          </p>
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <SearchBar />
        </div>
      </div>

      <Suspense fallback={null}>
        <SearchActions />
      </Suspense>
    </header>
  );
}

async function SearchActions() {
  const session = await auth();
  const isLogged = !!session?.user;

  if (isLogged) return null;

  return (
    <nav className="flex flex-wrap gap-2 sm:gap-3" aria-label="Ações de usuário">
      <Link
        href="/login"
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm font-medium transition"
      >
        Entrar
      </Link>

      <Link
        href="/register"
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs sm:text-sm font-medium transition"
      >
        Criar conta
      </Link>

      <Link
        href="/"
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
      >
        ← Voltar para Home
      </Link>
    </nav>
  );
}

type ProductGridProps = {
  searchQuery?: string;
  categoryId?: string;
};

async function ProductGrid({ searchQuery, categoryId }: ProductGridProps) {
  const whereClause: {
    active: boolean;
    stock: { gt: number };
    deletedAt: null;
    categoryId?: string;
    OR?: Array<{ name: { contains: string; mode: 'insensitive' } }>;
  } = {
    active: true,
    stock: { gt: 0 },
    deletedAt: null,
  };

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (searchQuery && searchQuery.trim()) {
    const normalizedQuery = searchQuery
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    whereClause.OR = [
      {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: normalizedQuery,
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
      salesCount: true,
      ratingAverage: true,
      ratingCount: true,
      category: {
        select: {
          slug: true,
          name: true,
        },
      },
      images: {
        orderBy: { position: "asc" },
        select: { url: true, position: true },
        take: 5,
      },
    },
  });

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-8 sm:py-12">
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
          {searchQuery
            ? `Nenhum produto encontrado para "${searchQuery}"`
            : "Nenhum produto disponível no momento"}
        </p>
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}

type CategoryFilterProps = {
  categories: Category[];
  selectedCategoryId?: string;
};

function CategoryFilter({ categories, selectedCategoryId }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <span className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
        Categoria:
      </span>
      <div className="flex gap-2">
        <Link
          href="/products"
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
            !selectedCategoryId
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?categoryId=${category.id}`}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              selectedCategoryId === category.id
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const searchQuery = params?.q;
  const categoryId = params?.categoryId;
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-3 py-4 sm:px-4 sm:py-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">
        <ProductsHeader />

        {categories.length > 0 && (
          <CategoryFilter 
            categories={categories} 
            selectedCategoryId={categoryId}
          />
        )}

        <section 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-8"
          aria-label="Lista de produtos"
        >
          <Suspense 
            fallback={
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-neutral-500">Carregando produtos...</p>
              </div>
            }
          >
            <ProductGrid searchQuery={searchQuery} categoryId={categoryId} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}