import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailgun";
import { generateToken } from "@/lib/token";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Resposta neutra (evita enumeração)
    if (!user || !user.password) {
      return NextResponse.json({ ok: true });
    }

    // Remove tokens antigos
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: "RESET_PASSWORD",
      },
    });

    const token = generateToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        type: "RESET_PASSWORD",
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Redefinição de senha",
      html: `
        <p>Você solicitou a redefinição de senha.</p>
        <p>
          <a href="${resetUrl}">
            Clique aqui para redefinir sua senha
          </a>
        </p>
        <p>Este link expira em 1 hora.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("request-password-reset error:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
