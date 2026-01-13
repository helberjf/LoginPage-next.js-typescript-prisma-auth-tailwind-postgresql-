import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendEmail } from "@/lib/mailgun";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email obrigatório" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Segurança: nunca revelar se o usuário existe
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  const token = generateToken();
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
      type: "RESET_PASSWORD",
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

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
