// app/api/register/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/auth/validation";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Normaliza email
    const email = data.email.toLowerCase();

    // Verifica se o email já existe
    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
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

    // Cria usuário (SEM first/last name)
    await prisma.user.create({
      data: {
        name: data.name, // <-- CORRETO
        email,
        password: passwordHash,
        cpf: data.cpf ?? null,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json(
      { message: "Usuário registrado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);

    if (error instanceof ZodError) {
      const message = error.issues?.[0]?.message;
      return NextResponse.json(
        { error: message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    );
  }
}
