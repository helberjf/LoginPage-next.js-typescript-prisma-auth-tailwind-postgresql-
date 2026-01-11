import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
    },
  });

  return NextResponse.json(products);
}
