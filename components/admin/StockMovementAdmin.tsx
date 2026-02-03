"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, RefreshCw, History } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  stock: number;
};

type StockMovement = {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  notes: string | null;
  createdAt: string;
  product: { name: string };
  user: { name: string | null; email: string | null };
};

export default function StockMovementAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    type: "ENTRY" as "ENTRY" | "EXIT" | "ADJUSTMENT",
    quantity: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch("/api/admin/products");
      if (!response.ok) throw new Error();
      const data = await response.json();
      // A API retorna um array direto, não um objeto com products
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao carregar produtos");
    }
  }

  async function fetchMovements() {
    try {
      const response = await fetch("/api/admin/inventory/movements?limit=20");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setMovements(data.movements || []);
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar movimentação");
      }

      toast.success(`Movimentação registrada! Novo estoque: ${data.newStock}`);
      setFormData({ productId: "", type: "ENTRY", quantity: "", reason: "", notes: "" });
      fetchProducts();
      fetchMovements();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar movimentação");
    } finally {
      setLoading(false);
    }
  }

  const selectedProduct = products.find((p) => p.id === formData.productId);

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Formulário de Movimentação */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Movimentação de Estoque
          </h2>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-2.5 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600"
          >
            <History size={14} />
            <span className="hidden md:inline">Histórico</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Tipo de Movimentação */}
            <div>
              <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-300">Tipo de Movimentação</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "ENTRY" })}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition ${
                    formData.type === "ENTRY"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-300/30"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <Plus size={18} className="text-green-600" />
                  <span className="text-[11px] font-medium">Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXIT" })}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition ${
                    formData.type === "EXIT"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-300/30"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <Minus size={18} className="text-red-600" />
                  <span className="text-[11px] font-medium">Saída</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "ADJUSTMENT" })}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition ${
                    formData.type === "ADJUSTMENT"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-300/30"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <RefreshCw size={18} className="text-blue-600" />
                  <span className="text-[11px] font-medium">Ajuste</span>
                </button>
              </div>
            </div>

            {/* Produto */}
            <div>
              <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-300">Produto</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Estoque atual: {product.stock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Quantidade */}
            <div>
              <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-300">
                {formData.type === "ADJUSTMENT" ? "Novo Estoque" : "Quantidade"}
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
                placeholder={formData.type === "ADJUSTMENT" ? "Valor final do estoque" : "Quantidade a movimentar"}
              />
              {selectedProduct && formData.quantity && formData.type !== "ADJUSTMENT" && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Novo estoque:{" "}
                  {formData.type === "ENTRY"
                    ? selectedProduct.stock + parseInt(formData.quantity)
                    : selectedProduct.stock - parseInt(formData.quantity)}
                </p>
              )}
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-300">Motivo</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
              >
                <option value="">Selecione o motivo</option>
                {formData.type === "ENTRY" && (
                  <>
                    <option value="Compra">Compra</option>
                    <option value="Devolução">Devolução de Cliente</option>
                    <option value="Produção">Produção Interna</option>
                    <option value="Transferência">Transferência</option>
                  </>
                )}
                {formData.type === "EXIT" && (
                  <>
                    <option value="Quebra">Quebra</option>
                    <option value="Perda">Perda</option>
                    <option value="Doação">Doação</option>
                    <option value="Amostra">Amostra Grátis</option>
                    <option value="Vencimento">Vencimento</option>
                    <option value="Defeito">Defeito/Avaria</option>
                  </>
                )}
                {formData.type === "ADJUSTMENT" && (
                  <>
                    <option value="Inventário">Contagem de Inventário</option>
                    <option value="Correção">Correção de Erro</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-600 dark:text-neutral-300">Observações (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
              placeholder="Informações adicionais sobre a movimentação..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processando..." : "Registrar Movimentação"}
          </button>
        </form>
      </div>

      {/* Histórico de Movimentações */}
      {showHistory && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Últimas 20 Movimentações
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="border-b dark:border-neutral-700">
                <tr className="text-left">
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Produto</th>
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4">Qtd</th>
                  <th className="pb-2 pr-4">Motivo</th>
                  <th className="pb-2">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b dark:border-neutral-700">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(movement.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 pr-4">{movement.product.name}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          movement.type === "ENTRY"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                            : movement.type === "EXIT"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                        }`}
                      >
                        {movement.type === "ENTRY" ? "Entrada" : movement.type === "EXIT" ? "Saída" : "Ajuste"}
                      </span>
                    </td>
                    <td className={`py-2 pr-4 font-medium ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                    </td>
                    <td className="py-2 pr-4">{movement.reason}</td>
                    <td className="py-2">{movement.user.name || movement.user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
