import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/auth/validation";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();

    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
      },
    });

    if (existingUser) {
      const hasCredentials = existingUser.accounts.some(
        acc => acc.provider === "credentials"
      );

      return NextResponse.json(
        {
          error: hasCredentials
            ? "Email já cadastrado"
            : "Este email está vinculado a uma conta social. Faça login com o provedor correspondente.",
        },
        { status: 409 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email,
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });

      // Perfil (dados pessoais)
      await tx.userProfile.create({
        data: {
          userId: user.id,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          // Se não vier, o Prisma aplica default OTHER
          ...(data.gender ? { gender: data.gender } : {}),
        },
      });

      // Conta local (credentials)
      await tx.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: user.id,
          access_token: passwordHash,
        },
      });
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
