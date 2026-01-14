import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { validateCpf } from "@/lib/validators/validateCpf";

type CheckoutItem = {
  productId: string;
  quantity: number;
  priceCents: number;
};

type CheckoutBody = {
  totalCents: number;
  items: CheckoutItem[];
  guest?: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
};

export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutBody;

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isLogged = !!userId;

  // ===== VALIDAÇÕES CENTRAIS =====
  if (!isLogged && !body.guest) {
    return NextResponse.json(
      { error: "Dados de visitante obrigatórios" },
      { status: 400 }
    );
  }

  if (isLogged && body.guest) {
    return NextResponse.json(
      { error: "Usuário logado não pode ser guest" },
      { status: 400 }
    );
  }

  // 🔑 narrowing explícito
  const guest = !isLogged ? body.guest! : null;

  // ===== CPF =====
  if (isLogged) {
    const user = await prisma.user.findUnique({
      where: { id: userId! },
      select: {
        profile: {
          select: {
            cpf: true,
          },
        },
      },
    });

    const cpf = user?.profile?.cpf;

    if (!cpf || !validateCpf(cpf)) {
      return NextResponse.json(
        { error: "CPF inválido ou não cadastrado" },
        { status: 400 }
      );
    }
  } else {
    if (!guest) {
      return NextResponse.json(
        { error: "Dados de visitante obrigatórios" },
        { status: 400 }
      );
    }

    if (!validateCpf(guest.cpf)) {
      return NextResponse.json(
        { error: "CPF do visitante inválido" },
        { status: 400 }
      );
    }
  }

  // ===== CRIAÇÃO DO PEDIDO =====
  const order = await prisma.order.create({
    data: {
      userId,
      guestFullName: guest?.name ?? null,
      guestEmail: guest?.email ?? null,
      guestCpf: guest?.cpf ?? null,
      guestPhone: guest?.phone ?? null,
      totalCents: body.totalCents,
      items: {
        create: body.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
