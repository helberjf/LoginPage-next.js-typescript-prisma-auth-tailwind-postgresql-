import prisma from "@/lib/prisma";
import { mailgun } from "@/lib/mailgun";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Nunca revele se o email existe
  if (!user) {
    return Response.json({ ok: true });
  }

  // Criar token seguro
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

  // Remover tokens antigos
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Criar novo token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset/${token}`;

  // Enviar email via Mailgun
  await mailgun.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: process.env.MAILGUN_FROM!,
    to: email,
    subject: "Recuperação de senha",
    html: `
      <p>Você solicitou recuperar sua senha.</p>
      <p>Clique no link abaixo para definir uma nova senha:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este link expira em 30 minutos.</p>
    `,
  });

  return Response.json({ ok: true });
}
