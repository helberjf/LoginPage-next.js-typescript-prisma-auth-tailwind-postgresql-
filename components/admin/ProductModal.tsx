// components/admin/ProductModal.tsx
"use client";

import ProductForm from "@/components/admin/ProductForm";

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  active: boolean;

  salesCount?: number | null;
  ratingAverage?: number | null;
  ratingCount?: number | null;

  discountPercent?: number | null;
  hasFreeShipping: boolean;
  couponCode?: string | null;

  images?: {
    url: string;
    position: number;
  }[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onUpdated: () => void;
  product: Product | null;
};

export default function ProductModal({
  open,
  onClose,
  onCreated,
  onUpdated,
  product,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {product ? "Editar produto" : "Novo produto"}
        </h2>

        <ProductForm
          productId={product?.id}
          onSuccess={() => {
            onClose();
            if (product) {
              onUpdated();
            } else {
              onCreated();
            }
          }}
        />
      </div>
    </div>
  );
}
