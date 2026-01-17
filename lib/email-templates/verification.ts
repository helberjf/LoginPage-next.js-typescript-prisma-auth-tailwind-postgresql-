// lib/email-templates/verification.ts
export function verificationEmailTemplate({
  verifyUrl,
  appName,
}: {
  verifyUrl: string;
  appName: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="100%" style="max-width:480px;background:#ffffff;border-radius:8px;padding:32px;font-family:Arial,sans-serif;">
            <tr>
              <td>
                <h2 style="margin:0 0 16px 0;color:#111827;">
                  Confirme seu email
                </h2>

                <p style="margin:0 0 24px 0;color:#374151;font-size:14px;line-height:1.5;">
                  Obrigado por se cadastrar no <strong>${appName}</strong>.
                  Para ativar sua conta, confirme seu endereço de email clicando no botão abaixo.
                </p>

                <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td align="center" bgcolor="#2563eb" style="border-radius:6px;">
                      <a href="${verifyUrl}"
                        style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">
                        Confirmar email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0;color:#6b7280;font-size:12px;line-height:1.5;">
                  Se o botão não funcionar, copie e cole este link no navegador:
                </p>

                <p style="word-break:break-all;font-size:12px;color:#2563eb;">
                  ${verifyUrl}
                </p>

                <p style="margin-top:24px;color:#9ca3af;font-size:12px;">
                  Este link expira em 24 horas.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin-top:16px;color:#9ca3af;font-size:11px;">
            © ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
