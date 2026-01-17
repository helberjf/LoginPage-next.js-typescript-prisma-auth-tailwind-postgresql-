import Link from "next/link";

type Product = {
  id: string;
  name: string;
  priceCents: number;

  salesCount?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;

  discountPercent?: number | null;
  hasFreeShipping?: boolean;

  images?: {
    url: string;
    position?: number;
  }[];
};

type ProductCardProps = {
  product: Product;
  isLogged: boolean;
};

export default function ProductCard({
  product,
  isLogged,
}: ProductCardProps) {
  const mainImage =
    product.images?.find(img => img.position === 0)?.url ??
    product.images?.[0]?.url ??
    "/placeholder.png";

  const basePrice = product.priceCents;

  const finalPrice =
    product.discountPercent && product.discountPercent > 0
      ? Math.round(basePrice * (1 - product.discountPercent / 100))
      : basePrice;

  return (
    <article className="border rounded-md bg-white dark:bg-neutral-900 overflow-hidden">
      {/* IMAGE — QUADRADA, PADRÃO ML */}
      <div className="aspect-square bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* INFO */}
      <div className="p-2 space-y-1">
        <div className="text-xs line-clamp-2 text-neutral-800 dark:text-neutral-100">
          {product.name}
        </div>

        <div className="text-[11px] text-neutral-500">
          ⭐ {(product.ratingAverage ?? 0).toFixed(1)} • {product.salesCount ?? 0} vendidos
        </div>

        <div className="text-sm font-semibold">
          R$ {(finalPrice / 100).toFixed(2)}
        </div>

        {product.discountPercent && (
          <div className="text-[11px] text-green-600">
            {product.discountPercent}% OFF
          </div>
        )}

        {product.hasFreeShipping && (
          <div className="text-[11px] text-green-600">
            Frete grátis
          </div>
        )}

        <Link
          href={`/products/${product.id}`}
          className="block mt-1 text-center text-[11px] py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Comprar
        </Link>
      </div>
    </article>
  );
}
