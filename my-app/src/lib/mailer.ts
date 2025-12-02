// src/lib/mailer.ts
"use server";

import nodemailer from "nodemailer";

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/(auth)/reset/${token}?email=${encodeURIComponent(email)}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Suporte" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Redefinir senha",
    html: `
      <p>Você pediu para redefinir sua senha.</p>
      <p>Clique no link abaixo para continuar:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Se você não pediu isso, ignore este email.</p>
    `,
  });
}
