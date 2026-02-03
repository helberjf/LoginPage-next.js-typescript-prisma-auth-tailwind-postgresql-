"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Search } from "lucide-react";
import StockMovementAdmin from "@/components/admin/StockMovementAdmin";

type CategoryData = {
  id: string;
  name: string;
  totalProducts: number;
  totalStock: number;
  totalValue: number;
};

type OrderByDay = {
  date: string;
  count: number;
  total: number;
};

type StockFlow = {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
};

type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

type InventoryData = {
  categories: CategoryData[];
  ordersByDay: OrderByDay[];
  stockFlow: StockFlow;
  topProducts: TopProduct[];
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  priceCents: number;
  stock: number;
  description: string | null;
  categoryId: string | null;
  category: {
    name: string;
  } | null;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  // Estados para pesquisa de produto
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/inventory");
        if (!response.ok) throw new Error("Erro ao carregar dados");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erro ao buscar dados de estoque:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Buscar produtos quando categoria for selecionada
  useEffect(() => {
    async function fetchProducts() {
      if (!selectedCategory) {
        setProducts([]);
        setSelectedProduct("");
        setProductDetails(null);
        return;
      }

      setLoadingProducts(true);
      try {
        const response = await fetch(`/api/admin/products?categoryId=${selectedCategory}`);
        if (!response.ok) throw new Error("Erro ao carregar produtos");
        const result = await response.json();
        setProducts(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  // Buscar detalhes do produto quando for selecionado
  useEffect(() => {
    async function fetchProductDetails() {
      if (!selectedProduct) {
        setProductDetails(null);
        return;
      }

      setLoadingDetails(true);
      try {
        const response = await fetch(`/api/admin/products?id=${selectedProduct}`);
        if (!response.ok) throw new Error("Erro ao carregar detalhes do produto");
        const result = await response.json();
        setProductDetails(result);
      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
        setProductDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    }

    fetchProductDetails();
  }, [selectedProduct]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-neutral-600 dark:text-neutral-400">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Erro ao carregar dados de estoque</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="px-4 py-3 md:px-0">
        <h1 className="text-xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Controle de Estoque
        </h1>
        <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Visão geral do inventário e movimentações
        </p>
      </div>

      {/* Movimentação de Estoque - Apenas para ADMIN */}
      {isAdmin && (
        <div className="px-4 md:px-0">
          <StockMovementAdmin />
        </div>
      )}

      {/* Card de Pesquisa de Produto */}
      <div className="px-4 md:px-0">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <h2 className="text-base md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Consultar Estoque de Produto
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Seletor de Categoria */}
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Categoria
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {data?.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Produto */}
            <div>
              <label htmlFor="product-select" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Produto
              </label>
              <select
                id="product-select"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={!selectedCategory || loadingProducts}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingProducts ? "Carregando..." : "Selecione um produto"}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detalhes do Produto */}
          {loadingDetails && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Carregando detalhes...</div>
            </div>
          )}

          {productDetails && !loadingDetails && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              {/* Versão compacta para mobile */}
              <div className="md:hidden space-y-2">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {productDetails.name}
                  </p>
                  {productDetails.sku && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">SKU: {productDetails.sku}</p>
                  )}
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-medium">Estoque:</span> {productDetails.stock} un.
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-medium">Preço:</span> R${" "}
                  {(productDetails.priceCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-medium">Total:</span> R${" "}
                  {((productDetails.priceCents / 100) * productDetails.stock).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Versão completa para desktop */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Nome e SKU */}
                <div className="col-span-full">
                  <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    {productDetails.name}
                  </h3>
                  {productDetails.sku && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      SKU: {productDetails.sku}
                    </p>
                  )}
                </div>

                {/* Preço */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Preço Unitário
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
                    R$ {(productDetails.priceCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Estoque */}
                <div className={`rounded-lg p-4 ${
                  productDetails.stock === 0
                    ? "bg-red-50 dark:bg-red-900/20"
                    : productDetails.stock < 10
                    ? "bg-orange-50 dark:bg-orange-900/20"
                    : "bg-green-50 dark:bg-green-900/20"
                }`}>
                  <p className={`text-xs md:text-sm font-medium mb-1 ${
                    productDetails.stock === 0
                      ? "text-red-600 dark:text-red-400"
                      : productDetails.stock < 10
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-green-600 dark:text-green-400"
                  }`}>
                    Quantidade em Estoque
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-xl md:text-2xl font-bold ${
                      productDetails.stock === 0
                        ? "text-red-700 dark:text-red-300"
                        : productDetails.stock < 10
                        ? "text-orange-700 dark:text-orange-300"
                        : "text-green-700 dark:text-green-300"
                    }`}>
                      {productDetails.stock}
                    </p>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">unidades</span>
                  </div>
                  {productDetails.stock === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Sem estoque</p>
                  )}
                  {productDetails.stock > 0 && productDetails.stock < 10 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Estoque baixo</p>
                  )}
                </div>

                {/* Valor Total */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-xs md:text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                    Valor Total em Estoque
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-purple-700 dark:text-purple-300">
                    R$ {((productDetails.priceCents / 100) * productDetails.stock).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Categoria */}
                {productDetails.category && (
                  <div className="col-span-full md:col-span-2 lg:col-span-1">
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      Categoria
                    </p>
                    <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                      {productDetails.category.name}
                    </p>
                  </div>
                )}

                {/* Descrição */}
                {productDetails.description && (
                  <div className="col-span-full">
                    <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      Descrição
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {productDetails.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedProduct && !loadingDetails && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Selecione uma categoria e um produto para visualizar as informações de estoque
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">Total de Produtos</p>
              <p className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {data.stockFlow.totalProducts}
              </p>
            </div>
            <Package className="w-8 h-8 md:w-10 md:h-10 text-blue-500 self-end md:self-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">Estoque Total</p>
              <p className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {data.stockFlow.totalStock}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-green-500 self-end md:self-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">Estoque Baixo</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {data.stockFlow.lowStock}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-orange-500 self-end md:self-auto" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 md:p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400">Sem Estoque</p>
              <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {data.stockFlow.outOfStock}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-red-500 self-end md:self-auto" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:gap-6 px-4 md:px-0 lg:grid-cols-2">
        {/* Gráfico de Pizza - Produtos por Categoria */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6 shadow-sm hover:shadow-md transition flex flex-col">
          <h2 className="text-base md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 md:mb-4">
            Produtos por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={250} className="md:hidden">
            <PieChart>
              <Pie
                data={data.categories}
                dataKey="totalProducts"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={false}
              >
                {data.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={260} className="hidden md:block">
            <PieChart>
              <Pie
                data={data.categories}
                dataKey="totalProducts"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={false}
              >
                {data.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", lineHeight: "16px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Estoque por Categoria */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6 shadow-sm hover:shadow-md transition flex flex-col">
          <h2 className="text-base md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 md:mb-4">
            Estoque por Categoria
          </h2>
          <ResponsiveContainer width="100%" height={250} className="md:hidden">
            <BarChart data={data.categories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="totalStock" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={240} className="hidden md:block">
            <BarChart data={data.categories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalStock" fill="#0088FE" name="Quantidade em Estoque" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Pedidos por Dia */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6 shadow-sm hover:shadow-md transition flex flex-col">
          <h2 className="text-base md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 md:mb-4">
            Pedidos dos Últimos 30 Dias
          </h2>
          <ResponsiveContainer width="100%" height={250} className="md:hidden">
            <BarChart data={data.ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                tick={{ fontSize: 9 }}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString("pt-BR")}
                formatter={(value, name) => {
                  if (!value) return ["0", name || ""];
                  if (name === "Total (R$)") {
                    return [`R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, name];
                  }
                  return [value, name || ""];
                }}
              />
              <Bar yAxisId="left" dataKey="count" fill="#00C49F" name="Pedidos" />
              <Bar yAxisId="right" dataKey="total" fill="#0088FE" name="Total (R$)" />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={240} className="hidden md:block">
            <BarChart data={data.ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" label={{ value: "Quantidade", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Valor (R$)", angle: 90, position: "insideRight" }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                formatter={(value, name) => {
                  if (!value) return ["0", name || ""];
                  if (name === "Total (R$)") {
                    return [`R$ ${(value as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, name];
                  }
                  return [value, name || ""];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#00C49F" name="Número de Pedidos" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="total" fill="#0088FE" name="Total (R$)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Produtos Mais Vendidos */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6 shadow-sm hover:shadow-md transition flex flex-col">
          <h2 className="text-base md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 md:mb-4">
            Top 10 Produtos Mais Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={250} className="md:hidden">
            <BarChart data={data.topProducts.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
          <ResponsiveContainer width="100%" height={240} className="hidden md:block">
            <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#FFBB28" name="Quantidade Vendida" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Categorias */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 md:p-6 mx-4 md:mx-0 shadow-sm hover:shadow-md transition">
        <h2 className="text-base md:text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3 md:mb-4">
          Detalhamento por Categoria
        </h2>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-xs md:text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3">Categoria</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Produtos</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Estoque</th>
                <th className="px-3 md:px-6 py-2 md:py-3">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category, index) => (
                <tr key={index} className="border-b dark:border-neutral-700">
                  <td className="px-3 md:px-6 py-3 md:py-4 font-medium">{category.name}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">{category.totalProducts}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4">{category.totalStock}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    R$ {category.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
