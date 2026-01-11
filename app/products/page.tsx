// app/products/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function ProductsPage() {
  const session = await auth();
  const isLogged = !!session?.user;

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
    },
  });

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">Produtos</h1>
          <p className="text-neutral-500">
            Veja, compare e escolha o melhor produto para você
          </p>

          {/* Ações globais para visitante */}
          {!isLogged && (
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
          )}
        </header>

        {/* Produtos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <article
              key={product.id}
              className="border rounded-xl bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">
                  {product.name}
                </h2>
                <p className="text-sm text-neutral-500 line-clamp-3">
                  {product.description}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-lg font-bold">
                  R$ {(product.priceCents / 100).toFixed(2)}
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 text-center px-4 py-2 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                  >
                    Ver detalhes
                  </Link>

                  {/* Comprar SEMPRE ativo */}
                  <Link
                    href={
                      isLogged
                        ? `/checkout/${product.id}`
                        : `/login?callbackUrl=/checkout/${product.id}`
                    }
                    className="flex-1 text-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                  >
                    Comprar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
