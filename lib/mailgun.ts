// lib/mailgun.ts
import FormData from "form-data";
import Mailgun from "mailgun.js";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const apiKey = process.env.MAILGUN_API_KEY?.trim();
  const domain = process.env.MAILGUN_DOMAIN?.trim();

  if (!apiKey) throw new Error("MAILGUN_API_KEY not set");
  if (!domain) throw new Error("MAILGUN_DOMAIN not set");

  const baseUrlRaw = process.env.MAILGUN_API_BASE_URL?.trim() || "https://api.mailgun.net";
  const baseUrl = baseUrlRaw.endsWith("/") ? baseUrlRaw.slice(0, -1) : baseUrlRaw;

  const fromEnv = process.env.MAILGUN_FROM?.trim();
  const fromName = process.env.MAILGUN_FROM_NAME?.trim();
  const fromEmail = process.env.MAILGUN_FROM_EMAIL?.trim();

  // Melhor fallback pro sandbox:
  const fallbackFrom = `Mailgun Sandbox <postmaster@${domain}>`;

  const fromAddress =
    fromEnv ||
    (fromName && fromEmail ? `${fromName} <${fromEmail}>` : fallbackFrom);

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: apiKey,
    url: baseUrl,
  });

  return mg.messages.create(domain, {
    from: fromAddress,
    to: [to.trim()],
    subject: subject || "Confirme seu email",
    text: "Abra este email para confirmar seu cadastro.",
    html,
  });
}
