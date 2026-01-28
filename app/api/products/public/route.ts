import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL)?.replace(/\/$/, "");
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const normalizeR2Url = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (R2_PUBLIC_URL && trimmed.includes("r2.cloudflarestorage.com")) {
    try {
      const parsed = new URL(trimmed);
      let path = parsed.pathname;
      if (R2_BUCKET_NAME && path.startsWith(`/${R2_BUCKET_NAME}/`)) {
        path = path.replace(`/${R2_BUCKET_NAME}`, "");
      }
      return `${R2_PUBLIC_URL}${path}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
};

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
    images: product.images.map((img) => {
      const normalizedPath = normalizeR2Url(img.path);
      return {
        url:
          img.storage === "R2" || normalizedPath.startsWith("http")
            ? normalizedPath
            : normalizedPath.startsWith("/uploads/")
            ? normalizedPath
            : `/uploads/${normalizedPath}`,
        position: img.position,
      };
    }),
  }));

  return NextResponse.json(productsWithUrls);
}