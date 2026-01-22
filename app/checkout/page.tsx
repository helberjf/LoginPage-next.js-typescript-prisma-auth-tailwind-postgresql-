"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem } = useCart();

  const totalCents = items.reduce(
    (sum, item) =>
      sum +
      (item.discountPercent && item.discountPercent > 0
        ? Math.round(item.priceCents * (1 - item.discountPercent / 100))
        : item.priceCents) *
        item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 mx-auto text-neutral-400" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Seu carrinho está vazio
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Adicione itens para continuar
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Ver catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const finalPrice =
                item.discountPercent && item.discountPercent > 0
                  ? Math.round(item.priceCents * (1 - item.discountPercent / 100))
                  : item.priceCents;

              return (
                <div
                  key={`${item.type}:${item.id}`}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex gap-4"
                >
                  <img
                    src={item.image ?? "/images/placeholder/iphone17ProMax.webp"}
                    alt={item.name}
                    className="w-20 h-20 object-contain bg-neutral-100 dark:bg-neutral-800 rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                      {item.name}
                    </h3>
                    {item.discountPercent && item.discountPercent > 0 && (
                      <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                        {item.discountPercent}% OFF
                      </div>
                    )}
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      R$ {(finalPrice / 100).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.type, -1)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.type, 1)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.type)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Resumo do pedido
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    R$ {(totalCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Frete</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Grátis
                  </span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      R$ {(totalCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout/payment"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                Ir para pagamento
              </Link>
              <Link
                href="/products"
                className="block w-full text-center text-sm text-blue-600 hover:text-blue-700"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
