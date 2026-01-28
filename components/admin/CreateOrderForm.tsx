"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string | null;
  email: string | null;
};

type Product = {
  id: string;
  name: string;
  priceCents: number;
};

type OrderItem = {
  productId: string;
  quantity: number;
};

type Props = {
  customers: Customer[];
  products: Product[];
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CreateOrderForm({ customers, products }: Props) {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [guestFullName, setGuestFullName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCpf, setGuestCpf] = useState("");
  const [items, setItems] = useState<OrderItem[]>([{ productId: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const totalCents = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      if (!product) return sum;
      return sum + product.priceCents * item.quantity;
    }, 0);
  }, [items, productMap]);

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    const next = [...items];
    if (field === "quantity") {
      const qty = Math.max(1, Number(value || 1));
      next[index].quantity = Number.isNaN(qty) ? 1 : qty;
    } else {
      next[index].productId = value;
    }
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validItems = items.filter((item) => item.productId);
    if (validItems.length === 0) {
      setError("Adicione ao menos um produto");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: userId || null,
          guestFullName: guestFullName || null,
          guestEmail: guestEmail || null,
          guestPhone: guestPhone || null,
          guestCpf: guestCpf || null,
          items: validItems,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erro ao criar pedido");
      }

      const data = await res.json();
      router.push(`/dashboard/admin/orders/${data.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Cliente (opcional)</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <option value="">Selecionar cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name ?? "Sem nome"} {customer.email ? `(${customer.email})` : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Se nenhum cliente for selecionado, preencha os dados abaixo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nome (opcional)</label>
          <input
            type="text"
            value={guestFullName}
            onChange={(e) => setGuestFullName(e.target.value)}
            placeholder="Nome completo"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email (opcional)</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="cliente@email.com"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Telefone (opcional)</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">CPF (opcional)</label>
          <input
            type="text"
            value={guestCpf}
            onChange={(e) => setGuestCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Itens do pedido</h2>
          <button
            type="button"
            onClick={handleAddItem}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Adicionar item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                  required
                >
                  <option value="">Selecionar produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} • {formatBRL(product.priceCents)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="sm:col-span-1 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.productId ? formatBRL((productMap.get(item.productId)?.priceCents ?? 0) * item.quantity) : "-"}
                </span>
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remover
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          Total: <span className="font-semibold">{formatBRL(totalCents)}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 sm:w-auto"
        >
          {loading ? "Salvando..." : "Criar pedido"}
        </button>
      </div>
    </form>
  );
}
