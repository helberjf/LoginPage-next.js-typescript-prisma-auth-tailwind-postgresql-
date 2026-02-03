import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Buscar todos os produtos com suas categorias
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });

    // Buscar pedidos dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Agregar dados por categoria
    const categoriesData: Record<string, {
      id: string;
      name: string;
      totalProducts: number;
      totalStock: number;
      totalValue: number;
    }> = {};

    products.forEach((product) => {
      const categoryId = product.category?.id || "sem-categoria";
      const categoryName = product.category?.name || "Sem Categoria";

      if (!categoriesData[categoryId]) {
        categoriesData[categoryId] = {
          id: categoryId,
          name: categoryName,
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0,
        };
      }

      categoriesData[categoryId].totalProducts += 1;
      categoriesData[categoryId].totalStock += product.stock;
      categoriesData[categoryId].totalValue += product.stock * (product.priceCents / 100);
    });

    // Agregar pedidos por dia
    const ordersByDay: Record<string, { date: string; count: number; total: number }> = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      
      if (!ordersByDay[dateKey]) {
        ordersByDay[dateKey] = {
          date: dateKey,
          count: 0,
          total: 0,
        };
      }

      ordersByDay[dateKey].count += 1;
      ordersByDay[dateKey].total += order.totalCents / 100;
    });

    // Calcular fluxo de estoque (produtos adicionados vs vendidos)
    const stockFlow = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      totalValue: products.reduce((sum, p) => sum + p.stock * (p.priceCents / 100), 0),
      lowStock: products.filter((p) => p.stock < 10).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    };

    // Estatísticas de produtos mais vendidos
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.product?.name || "Produto Desconhecido";
        
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            quantity: 0,
            revenue: 0,
          };
        }

        productSales[productName].quantity += item.quantity;
        productSales[productName].revenue += item.quantity * (item.priceCents / 100);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return NextResponse.json({
      categories: Object.values(categoriesData),
      ordersByDay: Object.values(ordersByDay).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      stockFlow,
      topProducts,
    });
  } catch (error) {
    console.error("Erro ao buscar dados de estoque:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de estoque" },
      { status: 500 }
    );
  }
}
