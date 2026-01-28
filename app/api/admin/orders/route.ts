import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = await req.json();
    const {
      userId,
      guestFullName,
      guestEmail,
      guestPhone,
      guestCpf,
      items,
    } = body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Itens são obrigatórios" }, { status: 400 });
    }

    const normalizedItems: OrderItemInput[] = items
      .filter((item: OrderItemInput) => item?.productId)
      .map((item: OrderItemInput) => ({
        productId: item.productId,
        quantity: Math.max(1, Number(item.quantity || 1)),
      }));

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Itens inválidos" }, { status: 400 });
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
        active: true,
      },
      select: { id: true, priceCents: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Produtos inválidos" }, { status: 400 });
    }

    const priceMap = new Map(products.map((p) => [p.id, p.priceCents]));
    const totalCents = normalizedItems.reduce((sum, item) => {
      const price = priceMap.get(item.productId) ?? 0;
      return sum + price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        guestFullName: guestFullName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        guestCpf: guestCpf || null,
        status: "PENDING",
        totalCents,
        currency: "BRL",
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: priceMap.get(item.productId) ?? 0,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
