import formData from "form-data";
import Mailgun from "mailgun.js";

if (!process.env.MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY not set");
}

if (!process.env.MAILGUN_DOMAIN) {
  throw new Error("MAILGUN_DOMAIN not set");
}

if (!process.env.MAILGUN_FROM) {
  throw new Error("MAILGUN_FROM not set");
}

const mg = new Mailgun(formData).client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: process.env.MAILGUN_API_BASE_URL ?? "https://api.eu.mailgun.net",
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: process.env.MAILGUN_FROM!,
    to,
    subject,
    html,
  });
}
