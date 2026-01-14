// app/api/forgot-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendEmail } from "@/lib/mailgun";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // 1️⃣ Rate limit — primeira coisa da rota
  const rl = rateLimit(req, {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  // 2️⃣ Ler e normalizar email
  const body = await req.json();
  const email = String(body?.email || "").toLowerCase().trim();

  if (!email) {
    return NextResponse.json(
      { error: "Email obrigatório" },
      { status: 400 }
    );
  }

  // 3️⃣ Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Segurança: nunca revelar se o usuário existe
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  // 4️⃣ Verificar se já existe token válido (30 min)
  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      type: "RESET_PASSWORD",
      expires: {
        gt: new Date(),
      },
    },
  });

  if (existingToken) {
    return NextResponse.json({ ok: true });
  }

  // 5️⃣ Limpa tokens antigos (defensivo)
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      type: "RESET_PASSWORD",
    },
  });

  // 6️⃣ Gerar token e salvar HASH
  const rawToken = generateToken();
  const hashedToken = await bcrypt.hash(rawToken, 10);

  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
      type: "RESET_PASSWORD",
    },
  });

  // 7️⃣ Enviar email
  const resetUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/reset/${rawToken}?email=${encodeURIComponent(email)}`;


  await sendEmail({
    to: email,
    subject: "Redefinição de senha",
    html: `
      <p>Você solicitou a redefinição de senha.</p>
      <p>
        <a href="${resetUrl}">Redefinir senha</a>
      </p>
      <p>Este link expira em 30 minutos.</p>
    `,
  
  });

  return NextResponse.json({ ok: true });
}
