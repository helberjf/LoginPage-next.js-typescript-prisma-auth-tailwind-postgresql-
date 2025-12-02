// src/app/api/reset/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { resetPasswordSchema } from "@/lib/auth/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, confirm } = resetPasswordSchema.parse(body);

    if (password !== confirm) {
      return NextResponse.json(
        { error: "As senhas não coincidem" },
        { status: 400 }
      );
    }

    const email = body.email;
    const token = body.token;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Dados insuficientes" },
        { status: 400 }
      );
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token }
    });

    if (!record) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 400 }
      );
    }

    if (new Date(record.expires) < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: email }
      });
      return NextResponse.json(
        { error: "Token expirado" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashed }
    });

    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}
