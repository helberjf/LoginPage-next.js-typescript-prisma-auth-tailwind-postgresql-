// app/categories/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Grid3X3, Package } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { normalizeR2Url } from "@/lib/utils/r2";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string | string[] }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawCategory = resolvedSearchParams.category;
  const selectedSlug = (Array.isArray(rawCategory) ? rawCategory[0] : rawCategory)?.trim();

  // Buscar categorias com contagem de produtos
  const categories = await prisma.category.findMany({
    where: {
      active: true,
      deletedAt: null,
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

  const selectedCategory = selectedSlug
    ? await prisma.category.findFirst({
        where: {
          slug: selectedSlug,
          active: true,
          deletedAt: null,
        },
        include: {
          products: {
            where: {
              active: true,
              deletedAt: null,
              stock: { gt: 0 },
            },
            include: {
              category: {
                select: { slug: true, name: true },
              },
              images: {
                orderBy: {
                  position: "asc",
                },
                take: 4,
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })
    : null;

  const productsWithUrls = selectedCategory
    ? selectedCategory.products.map((product) => ({
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
      }))
    : [];

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => {
            const isActive = selectedSlug === category.slug;
            return (
              <Link
                key={category.id}
                href={`/categories?category=${encodeURIComponent(category.slug)}`}
                className={[
                  "group bg-white dark:bg-neutral-900 rounded-md border p-3 sm:p-4 transition-all duration-200",
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
                    : "border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600",
                ].join(" ")}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  {/* Informações da categoria */}
                  <div className="flex-1 w-full">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {category.description}
                      </p>
                    )}

                    {/* Contador de produtos */}
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                      <Package className="w-2.5 h-2.5" />
                      {category._count.products} produto{category._count.products !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Produtos da categoria selecionada */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {selectedCategory ? `Produtos em ${selectedCategory.name}` : "Selecione uma categoria"}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {selectedCategory
                ? "Confira os itens disponíveis abaixo"
                : "Clique em uma categoria acima para ver os produtos"}
            </p>
          </div>
          {selectedCategory && (
            <Link
              href={`/categories?category=${encodeURIComponent(selectedCategory.slug)}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver página da categoria
            </Link>
          )}
        </div>

        {selectedCategory ? (
          productsWithUrls.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                Nenhum produto disponível nesta categoria no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productsWithUrls.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-8 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Escolha uma categoria para ver os produtos aqui.
            </p>
          </div>
        )}
      </div>

      {/* Seção de destaque */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 text-center">
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
