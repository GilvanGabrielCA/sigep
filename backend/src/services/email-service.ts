import { Resend } from 'resend'

export async function sendPasswordResetEmail(
  email: string,
  nome: string,
  rawToken: string,
): Promise<void> {
  const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')
  const resetLink = `${frontendUrl}/redefinir-senha?token=${rawToken}`

  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[SIGEP] ── Redefinição de senha (sem RESEND_API_KEY) ──`)
    console.log(`  Para: ${email}`)
    console.log(`  Link: ${resetLink}`)
    console.log(`  (válido por 1 hora)\n`)
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'SIGEP <onboarding@resend.dev>',
    to: email,
    subject: 'SIGEP — Redefinição de senha',
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;">
        <div style="margin-bottom:24px;">
          <span style="display:inline-block;background:linear-gradient(140deg,#FBBF24,#D97706);padding:8px 14px;border-radius:8px;font-size:14px;font-weight:700;color:#fff;letter-spacing:0.08em;">SIGEP</span>
        </div>
        <h2 style="font-size:22px;font-weight:700;color:#1C1917;margin:0 0 8px;">Redefinição de senha</h2>
        <p style="color:#78716C;font-size:15px;margin:0 0 24px;">Olá <strong style="color:#1C1917;">${nome}</strong>, você solicitou a redefinição da sua senha.</p>
        <p style="color:#57534E;font-size:14px;margin:0 0 24px;">Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong> e só pode ser usado uma vez.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(140deg,#E07B0A,#F59E0B);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.04em;">
            Redefinir senha
          </a>
        </div>
        <p style="color:#A8A29E;font-size:13px;margin:0 0 8px;">Se o botão não funcionar, copie e cole o link no navegador:</p>
        <p style="font-size:12px;word-break:break-all;color:#D97706;margin:0 0 32px;">${resetLink}</p>
        <hr style="border:none;border-top:1px solid #E7E5E0;margin:0 0 24px;" />
        <p style="color:#C4BFB9;font-size:12px;margin:0;">Se você não solicitou isso, ignore este e-mail. Sua senha permanece a mesma.</p>
        <p style="color:#D4CFC9;font-size:11px;margin:8px 0 0;">SIGEP — Sistema Integrado de Gestão de Pedidos</p>
      </div>
    `,
  })

  if (error) {
    console.log(`\n[SIGEP] ── Redefinição de senha (Resend falhou: ${error.message}) ──`)
    console.log(`  Para: ${email}`)
    console.log(`  Link: ${resetLink}`)
    console.log(`  (válido por 1 hora)\n`)
  }
}
