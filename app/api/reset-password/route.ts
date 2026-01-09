import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // ajuste se o seu lib exporta named export
import crypto from "crypto";
import bcrypt from "bcryptjs";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter ao menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Tentar encontrar o registro — primeiro por token raw (compatibilidade), depois por hash
    let record = await prisma.verificationToken.findUnique({
      where: { token }, // funciona se DB guarda token em texto puro
    });

    const tokenHash = sha256(token);

    if (!record) {
      // tenta pelo hash (modo seguro)
      record = await prisma.verificationToken.findUnique({
        where: { token: tokenHash },
      });
    }

    if (!record || record.expires < new Date()) {
      // respose genérica sobre token inválido/expirado
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Atualiza a senha
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: record.identifier },
      data: { password: hashed },
    });

    // Apagar token de acordo com como foi encontrado (raw ou hash)
    const tokenToDelete = record.token === token ? token : sha256(token);
    await prisma.verificationToken.delete({
      where: { token: tokenToDelete },
    });

    // Opcional: aqui você pode também invalidar sessions ou tokens JWT do usuário (se quiser)
    // await prisma.session.deleteMany({ where: { userId: user.id } })

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
