// src/app/api/register/route.ts
import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "../../../lib/auth/validation";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Sempre normalizar email
    const email = data.email.toLowerCase();

    // Verifica se o email já existe
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      // evita conflito com contas do Google sem senha
      const hasPassword = !!exists.password;

      return NextResponse.json(
        {
          error: hasPassword
            ? "Email já cadastrado"
            : "Este email está vinculado a uma conta do Google. Faça login com Google.",
        },
        { status: 409 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Cria usuário
    await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email,
        password: passwordHash,
      },
    });

    return NextResponse.json(
      { message: "Usuário registrado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);

    // Erros de validação do Zod
    if (error instanceof ZodError) {
      const issues = error.issues?.[0]?.message;
      return NextResponse.json({ error: issues ?? "Dados inválidos" }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 });
  }
}
