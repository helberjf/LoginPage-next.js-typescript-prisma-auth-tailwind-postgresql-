// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "../../../lib/mailgun";
import { rateLimit } from "../../../lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  message: z.string().min(5, "Mensagem muito curta"),
  turnstileToken: z.string().min(1, "Token inválido"),
});

// Rate-limit: 5 requisições por minuto por IP
const limiter = rateLimit({
  limit: 5,
  windowMs: 60_000,
});

// Função de validação do Turnstile
async function validateTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? "";

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
    }
  );

  const data = (await res.json()) as {
    success?: boolean;
  };

  return data.success === true;
}

export async function POST(req: Request) {
  try {
    // 1) Rate-limit por IP
    const ip =
      req.headers.get("x-forwarded-for") ??
      "unknown";

    const allowed = limiter(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 1 minuto." },
        { status: 429 }
      );
    }

    // 2) Validar input
    const data = await req.json();
    const parsed = contactSchema.parse(data);

    // 3) Validar Turnstile
    const isValid = await validateTurnstile(parsed.turnstileToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Falha na verificação. Tente novamente." },
        { status: 400 }
      );
    }

    // 4) Enviar email
    await sendContactEmail({
      name: parsed.name,
      email: parsed.email,
      message: parsed.message,
    });

    return NextResponse.json({
      ok: true,
      message: "Mensagem enviada com sucesso!",
    });
  } catch (err: unknown) {
    console.error("[CONTACT_ERROR]", err);

    // Zod error
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { error: "Erro interno ao enviar mensagem" },
      { status: 500 }
    );
  }
}
