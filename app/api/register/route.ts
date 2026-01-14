// app/api/register/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/auth/validation";
import { ZodError } from "zod";

// ================= Utils =================

function onlyDigits(v?: string | null) {
  return v ? v.replace(/\D/g, "") : null;
}

function isValidCPF(cpf?: string | null) {
  if (!cpf) return true;
  const n = onlyDigits(cpf);
  if (!n || n.length !== 11 || /^(\d)\1+$/.test(n)) return false;

  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(n[i]) * (10 - i);
  let d1 = (s * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(n[9])) return false;

  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(n[i]) * (11 - i);
  let d2 = (s * 10) % 11;
  if (d2 === 10) d2 = 0;

  return d2 === parseInt(n[10]);
}

// ================= Handler =================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ ÚNICA validação de telefone acontece aqui
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();
    const cpfNormalized = onlyDigits(data.cpf);

    if (cpfNormalized && !isValidCPF(cpfNormalized)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existingUser) {
      const hasCredentials = existingUser.accounts.some(
        a => a.provider === "credentials"
      );

      return NextResponse.json(
        {
          error: hasCredentials
            ? "Email já cadastrado"
            : "Use o provedor social correspondente.",
        },
        { status: 409 }
      );
    }

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

      await tx.userProfile.create({
        data: {
          userId: user.id,
          cpf: cpfNormalized,
          phone: data.phone, // ✅ já está em E.164
          birthDate: new Date(data.birthDate),
          gender: data.gender,
        },
      });

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

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-verification-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return NextResponse.json(
      { message: "Usuário registrado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao registrar usuário" },
      { status: 500 }
    );
  }
}
