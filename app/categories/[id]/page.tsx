// app/categories/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Grid3X3 } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

export default async function CategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
      products: {
        where: {
          active: true,
        },
        include: {
          images: {
            orderBy: {
              position: "asc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <section className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/categories"
          className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6" />
            {category.name}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {category._count.products} produto{category._count.products !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Descrição da categoria */}
      {category.description && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-3">Sobre esta categoria</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            {category.description}
          </p>
        </div>
      )}

      {/* Produtos da categoria */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Produtos
        </h2>

        {category.products.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
              <Package className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Não há produtos disponíveis nesta categoria no momento.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Ver Outras Categorias
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Links de navegação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <Link
          href="/categories"
          className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-md border border-neutral-300 dark:border-neutral-600 transition-colors"
        >
          Ver Todas as Categorias
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Ver Todos os Produtos
        </Link>
      </div>
    </section>
  );
}
