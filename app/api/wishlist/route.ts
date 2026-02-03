import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { productId?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  if (!productId) {
    return NextResponse.json({ error: "Produto inválido" }, { status: 400 });
  }

  try {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      create: {
        wishlistId: wishlist.id,
        productId,
      },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar na wishlist" },
      { status: 500 }
    );
  }
}
