//app/api/products/public/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: {
        gt: 0,
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
      salesCount: true,
      ratingAverage: true,
      ratingCount: true,
      discountPercent: true,
      hasFreeShipping: true,
      category: {
        select: {
          slug: true,
          name: true,
        },
      },
      images: {
        where: { position: 0 },
        select: { url: true, position: true },
      },
    },
  });

  return NextResponse.json(products);
}