// components/admin/ProductModal.tsx
"use client";

import ProductForm from "@/components/admin/ProductForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function ProductModal({ open, onClose, onCreated }: Props) {
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
          Novo produto
        </h2>

        <ProductForm
          onSuccess={() => {
            onClose();
            onCreated();
          }}
        />
      </div>
    </div>
  );
}
