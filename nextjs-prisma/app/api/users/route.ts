import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "../../../../my-app/auth";

// GET → somente usuários autenticados
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

// POST → bloqueado em produção
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Criação de usuário desativada em produção." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Email já existe" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(
body.password, 10);
 await bcrypt.hash(
body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashed,
        name: body.name ?? null,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso.",
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno ao criar usuário" },
      { status: 500 }
    );
  }
}
