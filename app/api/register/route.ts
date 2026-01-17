// app/api/register/route.ts
export const runtime = "nodejs";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/auth/validation";
import { ZodError } from "zod";
import { generateToken } from "@/lib/token";
import { sendEmail } from "@/lib/mailgun";
import { verificationEmailTemplate } from "@/lib/email-templates/verification";

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
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();
    const cpfNormalized = onlyDigits(data.cpf);

    if (cpfNormalized && !isValidCPF(cpfNormalized)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado." },
        { status: 409 }
      );
    }

    // 🔐 HASH DA SENHA
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 🔑 TOKEN DE VERIFICAÇÃO
    const token = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email,
          password: passwordHash,
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });

      await tx.userProfile.create({
        data: {
          userId: user.id,
          cpf: cpfNormalized,
          phone: data.phone,
          birthDate: new Date(data.birthDate),
          gender: data.gender,
        },
      });

      await tx.address.create({
        data: {
          userId: user.id,
          zipCode: data.address.zipCode,
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement,
          district: data.address.district,
          city: data.address.city,
          state: data.address.state.toUpperCase(),
          country: data.address.country ?? "BR",
          isDefault: true,
        },
      });

      // 🧾 TOKEN DE VERIFICAÇÃO
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
          type: "VERIFY_EMAIL",
        },
      });
    });

    // 📧 ENVIO DE EMAIL (FORA DA TRANSAÇÃO)
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Confirme seu email",
      html: verificationEmailTemplate({
        verifyUrl,
        appName: "Seu App",
      }),
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
