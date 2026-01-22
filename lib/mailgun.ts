// lib/mailgun.ts
import FormData from "form-data";
import Mailgun from "mailgun.js";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error("MAILGUN_API_KEY not set");
  }

  if (!process.env.MAILGUN_DOMAIN) {
    throw new Error("MAILGUN_DOMAIN not set");
  }

  const fromName = process.env.MAILGUN_FROM_NAME?.trim();
  const fromEmail = process.env.MAILGUN_FROM_EMAIL?.trim();
  const fromEnv = process.env.MAILGUN_FROM?.trim();
  const fromAddress = fromEnv
    ? fromEnv
    : fromName && fromEmail
      ? `${fromName} <${fromEmail}>`
      : `Mailgun Sandbox <postmaster@${process.env.MAILGUN_DOMAIN}>`;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net",
  });

  return mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: fromAddress,
    to: [to.trim()],
    subject: subject || "Redefinição de senha",
    text: "Você solicitou a redefinição de senha.",
    html,
  });
}
