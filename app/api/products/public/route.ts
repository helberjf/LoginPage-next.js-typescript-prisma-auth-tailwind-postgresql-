import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: {
        gt: 0,
      },
      deletedAt: null,
      ...(categoryId && { categoryId }),
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
        select: { path: true, storage: true, position: true },
      },
    },
  });

  const productsWithUrls = products.map((product) => ({
    ...product,
    images: product.images.map((img) => ({
      url:
        img.storage === "R2" || img.path.startsWith("http")
          ? img.path
          : `/uploads/${img.path}`,
      position: img.position,
    })),
  }));

  return NextResponse.json(productsWithUrls);
}