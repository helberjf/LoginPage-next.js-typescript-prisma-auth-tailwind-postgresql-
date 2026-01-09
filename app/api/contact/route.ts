import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/mailgun";
import { rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await rateLimit(req, {
      limit: 5,
      windowMs: 1000 * 60, // 1 minuto
    });

    const body = await req.json();
    const { name, email, message } = contactSchema.parse(body);

    await sendEmail({
      to: process.env.CONTACT_EMAIL!,
      subject: "Novo contato pelo site",
      html: `
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 400 }
    );
  }
}
