import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.user.findMany({
    where: {
      role: "STAFF",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ employees });
}
