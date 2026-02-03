import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          cpf: true,
          phone: true,
        },
      },
      addresses: {
        where: { isDefault: true },
        select: {
          street: true,
          number: true,
          complement: true,
          district: true,
          city: true,
          state: true,
          zipCode: true,
        },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    user,
  });
}
