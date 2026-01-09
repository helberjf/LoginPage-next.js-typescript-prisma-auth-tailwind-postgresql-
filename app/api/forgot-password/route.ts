import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailgun";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return Response.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset/${token}`;

  await sendEmail({
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
