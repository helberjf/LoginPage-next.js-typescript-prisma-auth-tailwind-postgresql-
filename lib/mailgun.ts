import formData from "form-data";
import Mailgun from "mailgun.js";

const mg = new Mailgun(formData).client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
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
