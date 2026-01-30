// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { removeAccents } from "@/lib/utils/utils";
import { normalizeR2Url } from "@/lib/utils/r2";

/**
 * Validators
 */
const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  priceCents: z.number().int().positive(),
  stock: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),

  discountPercent: z.number().int().min(1).max(90).nullable().optional(),
  hasFreeShipping: z.boolean().optional(),
  couponCode: z.string().min(3).nullable().optional(),

  images: z
    .array(
      z.object({
        url: z.string().url(),
        position: z.number().int().nonnegative(),
      })
    )
    .optional(),
});

const productUpdateSchema = productCreateSchema
  .partial()
  .extend({
    id: z.string().min(1),
  });

/**
 * GET
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const q = url.searchParams.get("q");
  const normalizedQ = q ? removeAccents(q) : null;
  const categoryId = url.searchParams.get("categoryId");

  if (id) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: {
          orderBy: { position: "asc" },
          select: { path: true, storage: true, position: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const productWithUrls = {
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
      salesCount: product.salesCount ?? 0,
      ratingAverage: product.ratingAverage ?? 0,
      ratingCount: product.ratingCount ?? 0,
    };

    return NextResponse.json(productWithUrls);
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
      ...(normalizedQ
        ? {
            OR: [
              { name: { contains: normalizedQ, mode: "insensitive" } },
              { description: { contains: normalizedQ, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      images: {
        orderBy: { position: "asc" },
        select: { path: true, storage: true, position: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      images: p.images.map((img) => {
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
      salesCount: p.salesCount ?? 0,
      ratingAverage: p.ratingAverage ?? 0,
      ratingCount: p.ratingCount ?? 0,
    }))
  );
}

/**
 * POST
 */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = await request.json();
  const parsed = productCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const created = await prisma.product.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      priceCents: data.priceCents,
      stock: data.stock ?? 0,
      active: data.active ?? true,

      discountPercent: data.discountPercent ?? null,
      hasFreeShipping: data.hasFreeShipping ?? false,

      images: data.images
        ? {
            createMany: {
              data: data.images.map((img) => ({
                  path: normalizeR2Url(img.url),
                storage: img.url.startsWith("http") ? "R2" : "LOCAL",
                position: img.position,
              })),
            },
          }
        : undefined,
    },
    include: {
      images: { select: { path: true, storage: true, position: true } },
    },
  });

  return NextResponse.json(
    {
      ...created,
      images: created.images.map((img) => {
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
    },
    { status: 201 }
  );
}

/**
 * PUT
 */
export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = await request.json();
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, images, categoryId, couponCode, ...data } = parsed.data;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        images: images
          ? {
              deleteMany: {},
              createMany: {
                data: images.map((img) => ({
                  path: normalizeR2Url(img.url),
                  storage: img.url.startsWith("http") ? "R2" : "LOCAL",
                  position: img.position,
                })),
              },
            }
          : undefined,
      },
      include: {
        images: { select: { path: true, storage: true, position: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      images: updated.images.map((img) => {
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
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

/**
 * DELETE (soft delete)
 */
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }
}
