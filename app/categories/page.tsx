// app/categories/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Grid3X3, Package } from "lucide-react";

export default async function CategoriesPage() {
  // Buscar categorias com contagem de produtos
  const categories = await prisma.category.findMany({
    where: {
      active: true,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <section className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-center gap-2">
          <Grid3X3 className="w-6 h-6" />
          Categorias
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Navegue por nossas categorias de produtos
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
            <Grid3X3 className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            As categorias de produtos aparecerão aqui quando forem adicionadas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Ícone da categoria */}
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                {/* Informações da categoria */}
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}

                  {/* Contador de produtos */}
                  <div className="inline-flex items-center gap-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded-full">
                    <Package className="w-3 h-3" />
                    {category._count.products} produto{category._count.products !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Seção de destaque */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 text-center">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Não encontrou o que procura?
        </h2>
        <p className="text-blue-800 dark:text-blue-200 mb-6">
          Navegue por todos os nossos produtos ou entre em contato para ajuda especializada.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Ver Todos os Produtos
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-blue-600 dark:text-blue-400 font-medium rounded-md border border-blue-300 dark:border-blue-600 transition-colors"
          >
            Fale Conosco
          </Link>
        </div>
      </div>
    </section>
  );
}
