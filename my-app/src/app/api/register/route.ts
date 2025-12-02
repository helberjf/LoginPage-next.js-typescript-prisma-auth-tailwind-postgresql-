import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { registerSchema } from "@/lib/auth/validation";
import type { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validação com Zod
    const data = registerSchema.parse(body);

    // Verifica se o email já existe
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        name: data.name ?? null,
        email: data.email,
        password: passwordHash,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário registrado com sucesso",
        user: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);

    // Erro do Zod (tipado corretamente)
    if (isZodError(error)) {
      const message =
        error.issues?.[0]?.message ?? "Dados inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    );
  }
}

// Função auxiliar para evitar any
function isZodError(err: unknown): err is ZodError {
  return typeof err === "object" && err !== null && "issues" in err;
}
