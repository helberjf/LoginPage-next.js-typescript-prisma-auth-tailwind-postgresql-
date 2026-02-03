// app/api/send-verification-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/token";
import { sendEmail } from "@/lib/mailgun";
import { verificationEmailTemplate } from "@/lib/email-templates/verification";

export const runtime = "nodejs";

const COOLDOWN_MINUTES = 5;

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Erro desconhecido";
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { email?: unknown } | null;

    const email = body?.email;
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email obrigatório" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Resposta padrão (não vaza se existe ou não existe conta)
    const genericOkResponse = NextResponse.json({
      ok: true,
      message:
        "Se este email estiver cadastrado, você receberá um link de confirmação. Verifique a caixa de entrada e o spam.",
    });

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true },
    });

    // Se não existe ou já está verificado, retorna a mesma mensagem genérica
    if (!user || user.emailVerified) {
      return genericOkResponse;
    }

    // ⏱️ Cooldown
    const lastToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        type: "VERIFY_EMAIL",
      },
      orderBy: { expires: "desc" },
      select: { expires: true },
    });

    if (lastToken) {
      // você estava inferindo "createdAt" a partir do expires - mantém a lógica
      const createdAt = new Date(lastToken.expires.getTime() - 1000 * 60 * 60 * 24);
      const diffMinutes = (Date.now() - createdAt.getTime()) / 1000 / 60;

      if (diffMinutes < COOLDOWN_MINUTES) {
        // ✅ Não mude o formato do retorno (evita vazamento por diferença)
        return genericOkResponse;
      }
    }

    // Limpa tokens antigos
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        type: "VERIFY_EMAIL",
      },
    });

    // Cria novo token
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL not set");
    }

    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: "Confirme seu email",
      html: verificationEmailTemplate({
        verifyUrl,
        appName: "Seu App",
      }),
    });

    return genericOkResponse;
  } catch (err: unknown) {
    console.error("send-verification-email error:", err);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
