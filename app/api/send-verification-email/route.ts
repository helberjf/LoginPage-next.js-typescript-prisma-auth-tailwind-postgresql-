import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendEmail } from "@/lib/mailgun";
import { verificationEmailTemplate } from "@/lib/email-templates/verification";


const COOLDOWN_MINUTES = 5;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email obrigatório" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({ ok: true });
    }

    // ⏱️ Rate limit por cooldown
    const lastToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        type: "VERIFY_EMAIL",
      },
      orderBy: { expires: "desc" },
    });

    if (lastToken) {
      const createdAt = new Date(
        lastToken.expires.getTime() - 1000 * 60 * 60 * 24
      );

      const diffMinutes =
        (Date.now() - createdAt.getTime()) / 1000 / 60;

      if (diffMinutes < COOLDOWN_MINUTES) {
        return NextResponse.json({ ok: true });
      }
    }

    // Limpa tokens antigos
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        type: "VERIFY_EMAIL",
      },
    });

    const token = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
        type: "VERIFY_EMAIL",
      },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: "Confirme seu email",
      html: verificationEmailTemplate({
        verifyUrl,
        appName: "Seu App",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-verification-email error:", err);
    return NextResponse.json({ ok: true });
  }
}
