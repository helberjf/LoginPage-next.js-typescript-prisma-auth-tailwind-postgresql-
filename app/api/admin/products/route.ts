// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Admin guard
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const q = url.searchParams.get("q");

  if (id) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { position: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      salesCount: product.salesCount ?? 0,
      ratingAverage: product.ratingAverage ?? 0,
      ratingCount: product.ratingCount ?? 0,
    });
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map(p => ({
      ...p,
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
      couponCode: data.couponCode?.trim() ?? null,

      images: data.images
        ? {
            createMany: {
              data: data.images.map(img => ({
                url: img.url,
                position: img.position,
              })),
            },
          }
        : undefined,
    },
    include: {
      images: true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

/**
 * PUT
 */
export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, images, ...data } = parsed.data;

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,

        images: images
          ? {
              deleteMany: {},
              createMany: {
                data: images.map(img => ({
                  url: img.url,
                  position: img.position,
                })),
              },
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }
}

/**
 * DELETE (soft delete)
 */
export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
