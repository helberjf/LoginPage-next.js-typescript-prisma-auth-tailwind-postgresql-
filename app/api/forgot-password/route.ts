import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailgun";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await rateLimit(req, {
      limit: 5,
      windowMs: 1000 * 60, // 1 minuto
    });

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Nunca revelar se o email existe
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

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
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este link expira em 30 minutos.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar solicitação." },
      { status: 400 }
    );
  }
}
