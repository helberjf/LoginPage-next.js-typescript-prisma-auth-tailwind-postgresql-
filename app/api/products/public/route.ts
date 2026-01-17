import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: {
        gt: 0, // recomendado
      },
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      discountPercent: true,
      hasFreeShipping: true,
      images: {
        where: { position: 0 },
        select: { url: true },
      },
    },
  });

  return NextResponse.json(products);
}
