import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Truck, RotateCcw, Star, Calendar, Clock } from "lucide-react";
import PurchaseBoxClient from "./PurchaseBoxClient";
import ImageGallery from "./ImageGallery";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams?.id;

  if (!productId) {
    return {
      title: "Produto não encontrado",
    };
  }

  const product = await prisma.product.findFirst({
    where: {
      active: true,
      deletedAt: null,
      id: productId,
    },
    select: {
      name: true,
      description: true,
      priceCents: true,
      discountPercent: true,
      images: {
        where: { position: 0 },
        select: { url: true },
      },
      category: {
        select: { name: true },
      },
    },
  });

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  const finalPrice =
    product.discountPercent && product.discountPercent > 0
      ? Math.round(product.priceCents * (1 - product.discountPercent / 100))
      : product.priceCents;

  const imageUrl = product.images?.[0]?.url || "/placeholder.png";

  return {
    title: `${product.name} - R$ ${(finalPrice / 100).toFixed(2)}`,
    description: product.description || `Compre ${product.name} com o melhor preço e frete grátis`,
    openGraph: {
      title: product.name,
      description: product.description || `Compre ${product.name} agora`,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const session = await auth();
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams?.id;
  
  if (!productId) {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: {
      active: true,
      deletedAt: null,
      id: productId,
    },
    include: {
      images: {
        orderBy: { position: "asc" },
        select: { url: true, position: true },
      },
      category: {
        select: { 
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const isServiceSchedule = product.category?.slug === "atendimento";

  const finalPrice =
    product.discountPercent && product.discountPercent > 0
      ? Math.round(product.priceCents * (1 - product.discountPercent / 100))
      : product.priceCents;

  const isLogged = !!session?.user;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isServiceSchedule ? "Service" : "Product",
    "name": product.name,
    "description": product.description || "",
    "image": product.images?.[0]?.url || "/placeholder.png",
    "offers": {
      "@type": "Offer",
      "price": (finalPrice / 100).toFixed(2),
      "priceCurrency": "BRL",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.ratingAverage && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.ratingAverage,
        "reviewCount": product.ratingCount || 0,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen bg-white dark:bg-neutral-950">
        {/* Breadcrumb */}
        <nav 
          className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-3 py-2"
          aria-label="Breadcrumb"
        >
          <ol className="max-w-6xl mx-auto text-xs sm:text-sm flex items-center flex-wrap">
            <li>
              <Link href="/products" className="text-blue-600 hover:text-blue-700">
                {isServiceSchedule ? "Serviços" : "Produtos"}
              </Link>
            </li>
            {product.category && (
              <>
                <li className="mx-1.5 text-neutral-400">/</li>
                <li>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {product.category.name}
                  </span>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
            {/* Left: Images */}
            <aside className="lg:col-span-1">
              <ImageGallery images={product.images || []} productName={product.name} />
            </aside>

            {/* Right: Info & Purchase */}
            <article className="lg:col-span-2 space-y-4">
              {/* Product Name & Badge */}
              <header className="space-y-2">
                {isServiceSchedule && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-[10px] sm:text-xs font-semibold">
                    <Calendar className="w-3 h-3" />
                    Serviço com Agendamento
                  </div>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {product.name}
                </h1>
              </header>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{(product.ratingAverage ?? 0).toFixed(1)}</span>
                </div>
                <span className="text-neutral-500">
                  ({product.ratingCount ?? 0} {product.ratingCount === 1 ? "avaliação" : "avaliações"})
                </span>
                <span className="text-neutral-500 border-l border-neutral-300 pl-2">
                  {product.salesCount ?? 0} {isServiceSchedule ? "atendimentos" : "vendidos"}
                </span>
              </div>

              {/* Purchase Box */}
              <PurchaseBoxClient 
                productId={product.id} 
                isLogged={isLogged}
                isServiceSchedule={isServiceSchedule}
              />

              {/* Price Section */}
              <div className={`${isServiceSchedule ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'} rounded-lg p-3 sm:p-4 border`}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    R$ {(finalPrice / 100).toFixed(2)}
                  </span>
                  {product.discountPercent && product.discountPercent > 0 && (
                    <>
                      <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-through">
                        R$ {(product.priceCents / 100).toFixed(2)}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                        {product.discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Benefits */}
              <section className="space-y-2.5" aria-label="Benefícios">
                {isServiceSchedule ? (
                  <>
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                          Agendamento Flexível
                        </h3>
                        <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                          Escolha o melhor horário para você
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                          Atendimento Profissional
                        </h3>
                        <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                          Técnicos especializados e experientes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                          Garantia do Serviço
                        </h3>
                        <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                          90 dias de garantia em peças e mão de obra
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {product.hasFreeShipping && (
                      <div className="flex items-start gap-2.5">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                            Frete grátis
                          </h3>
                          <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                            Em compras acima de R$ 100
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5">
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                          Devolução grátis
                        </h3>
                        <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                          Você tem 30 dias para devolver
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* Stock & Quantity - Apenas para produtos normais */}
              {!isServiceSchedule && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {product.stock > 0 ? "Em estoque" : "Fora de estoque"}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400 ml-2">
                        ({product.stock} disponível{product.stock !== 1 ? "is" : ""})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor="quantity-select" 
                        className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                      >
                        Quantidade:
                      </label>
                      <select 
                        id="quantity-select"
                        className="px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-xs sm:text-sm"
                      >
                        {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Cupom */}
              {product.couponCode && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800">
                  <div className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 uppercase mb-1.5">
                    {isServiceSchedule ? "Código de Referência" : "Cupom de desconto"}
                  </div>
                  <div className="bg-white dark:bg-neutral-800 px-2.5 py-1.5 rounded border border-blue-200 dark:border-blue-800 font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                    {product.couponCode}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </main>
    </>
  );
}