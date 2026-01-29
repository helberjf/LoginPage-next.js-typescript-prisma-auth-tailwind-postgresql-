import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL)?.replace(/\/$/, "");
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

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              discountPercent: true,
              hasFreeShipping: true,
              salesCount: true,
              ratingCount: true,
              category: {
                select: { slug: true, name: true },
              },
              images: {
                select: { path: true, storage: true, position: true },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const products = wishlist?.items?.map((item) => {
    const product = item.product;
    return {
      ...product,
      images: product.images.map((img) => {
        const normalizedPath = normalizeR2Url(img.path);
        const url =
          img.storage === "R2" || normalizedPath.startsWith("http")
            ? normalizedPath
            : normalizedPath.startsWith("/uploads/")
            ? normalizedPath
            : `/uploads/${normalizedPath}`;

        return {
          url,
          position: img.position,
        };
      }),
    };
  }) ?? [];

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Wishlist
          </h1>
          <p className="text-neutral-500">
            Seus produtos favoritos salvos para ver depois
          </p>
        </header>

        {products.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center space-y-3">
            <p className="text-neutral-600 dark:text-neutral-400">
              Sua wishlist está vazia no momento.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
