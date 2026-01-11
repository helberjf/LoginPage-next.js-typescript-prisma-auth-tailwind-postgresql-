import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
  };
  isLogged: boolean;
};

export default function ProductCard({
  product,
  isLogged,
}: ProductCardProps) {
  return (
    <article className="border rounded-xl bg-white dark:bg-neutral-900 p-5 flex flex-col justify-between">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">{product.name}</h2>
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
  );
}
