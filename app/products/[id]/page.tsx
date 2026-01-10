import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

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
  });

  if (!product) {
    notFound();
  }

  const isLogged = !!session?.user;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>
          <p className="text-neutral-500">
            {product.description}
          </p>
        </header>

        {/* Price */}
        <div className="text-3xl font-bold">
          R$ {(product.priceCents / 100).toFixed(2)}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={
              isLogged
                ? `/api/checkout?productId=${product.id}`
                : `/checkout/guest?productId=${product.id}`
            }
            className="px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Comprar agora
          </Link>

          <Link
            href="/products"
            className="px-6 py-3 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Voltar para produtos
          </Link>
        </div>
      </div>
    </main>
  );
}
