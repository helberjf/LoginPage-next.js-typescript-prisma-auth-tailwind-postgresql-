import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mg = new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

export async function sendContactEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  return mg.messages.create(process.env.MAILGUN_DOMAIN!, {
    from: `Contato <mailgun@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject,
    text,
  });
}
