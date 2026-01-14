// lib/mailgun.ts
import FormData from "form-data";
import Mailgun from "mailgun.js";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY!,
    url: process.env.MAILGUN_API_BASE_URL ?? "https://api.mailgun.net",
  });

  return mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: process.env.MAILGUN_FROM!,
    to: [to],
    subject,
    html,
  });
}
