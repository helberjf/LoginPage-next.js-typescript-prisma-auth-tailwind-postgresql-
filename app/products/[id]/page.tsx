import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ShieldCheck } from "lucide-react";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: PageProps) {
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
      active: true,
    },
    include: {
      images: {
        orderBy: { position: "asc" },
        select: { url: true, position: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const isLogged = !!session?.user;

  const mainImage =
    product.images?.find((img) => img.position === 0)?.url ??
    product.images?.[0]?.url ??
    "/placeholder.png";

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-neutral-600 hover:underline dark:text-neutral-300"
        >
          Voltar para produtos
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <div className="aspect-square bg-white dark:bg-neutral-800">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          <div className="space-y-4">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {product.name}
              </h1>
              {product.description ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {product.description}
                </p>
              ) : null}
            </header>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                R$ {(product.priceCents / 100).toFixed(2)}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                ⭐ {(product.ratingAverage ?? 0).toFixed(1)} • {product.salesCount ?? 0} vendidos
              </div>
              {product.discountPercent ? (
                <div className="text-xs text-green-600">{product.discountPercent}% OFF</div>
              ) : null}
              {product.hasFreeShipping ? (
                <div className="text-xs text-green-600">Frete grátis</div>
              ) : null}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Compre com segurança diretamente pelo MercadoPago
              </div>

              <div className="mt-3">
                <Link
                  href={`/checkout/guest?productId=${product.id}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Comprar via MercadoPago
                </Link>
              </div>
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              ID do produto: {product.id}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
