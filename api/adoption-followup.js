import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = process.env.FROM_EMAIL     ?? 'LoveCats <noreply@lovecats.com.br>';
const REPLY_TO = process.env.REPLY_TO_EMAIL ?? 'equipelovecats@gmail.com';
const BASE_URL = (process.env.BASE_URL ?? 'https://lovecats.com.br').replace(/\/$/, '');

// ── Resend e-mail HTML (follow-up flavour) ────────────────────────────────────
function followUpEmailHTML({ catName, donorName, confirmUrl, denyUrl, isAdopter }) {
  const headline = isAdopter
    ? `Lembrete: como foi a adoção de <strong>${catName}</strong>? 🐱`
    : `Lembrete: <strong>${catName}</strong> encontrou um lar?`;

  const intro = isAdopter
    ? `Olá! Há alguns dias você demonstrou interesse em adotar <strong>${catName}</strong> pela LoveCats. Adoraríamos saber como foi — sua resposta ajuda a manter os anúncios atualizados para todos.`
    : `Olá, <strong>${donorName ?? 'tutor'}</strong>! Ainda não recebemos confirmação sobre a adoção de <strong>${catName}</strong>. Por favor, nos informe se o processo foi concluído.`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lembrete de adoção — LoveCats</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1c1815;padding:24px 32px;text-align:center;">
              <img src="${BASE_URL}/src/images/logo-icone.png" alt="LoveCats" width="36" height="36"
                style="display:inline-block;vertical-align:middle;margin-right:10px;" />
              <span style="display:inline-block;vertical-align:middle;font-size:22px;font-weight:700;color:#e07535;letter-spacing:-0.01em;">LoveCats</span>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#e07535 0%,#f08545 100%);height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 24px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#a89880;text-transform:uppercase;letter-spacing:0.08em;">📬 Lembrete</p>
              <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1c1815;line-height:1.35;">${headline}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#4a3f35;line-height:1.7;">${intro}</p>

              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#7a6858;text-transform:uppercase;letter-spacing:0.07em;">A adoção foi confirmada?</p>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="${confirmUrl}"
                      style="display:inline-block;background:#e07535;color:#ffffff;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                      ✓ Sim, foi adotado!
                    </a>
                  </td>
                  <td>
                    <a href="${denyUrl}"
                      style="display:inline-block;background:#f5f0ea;color:#4a3f35;border:1px solid #d4c5b5;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
                      ✕ Não, ainda disponível
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background:#faf7f4;border:1px solid #e8dfd5;border-radius:8px;padding:14px 18px;font-size:13px;color:#7a6858;line-height:1.6;">
                <strong style="display:block;margin-bottom:4px;color:#4a3f35;">Por que estamos perguntando?</strong>
                Ao confirmar a adoção, o anúncio é automaticamente marcado como <em>adotado</em>. Caso a adoção não tenha ocorrido, o gatinho continua disponível para outras famílias.
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e8dfd5;margin:0;" /></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#a89880;">Você está recebendo este e-mail porque registrou interesse em uma adoção na LoveCats.</p>
              <p style="margin:0;font-size:12px;color:#a89880;">
                Adicione <strong>equipelovecats@gmail.com</strong> aos seus contatos para garantir o recebimento das nossas mensagens.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * POST /api/adoption-followup
 * Called by Vercel cron — sends follow-up emails for pending adoptions older than 7 days.
 *
 * Security: verifies Authorization: Bearer <CRON_SECRET> header.
 * Vercel also sets x-vercel-signature on cron requests; checking CRON_SECRET is sufficient.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Auth check — Vercel sets the CRON_SECRET automatically when configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers['authorization'] ?? '';
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }

  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }

  // Find all pending adoptions that have been waiting for ≥ 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: pending, error } = await supabaseAdmin
    .from('anuncios_doacao')
    .select('id, nome_gato, nome_doador, email, email_adotante, adoption_token')
    .eq('status', 'disponivel')
    .not('adoption_token', 'is', null)
    .not('email_adotante', 'is', null)
    .lte('adoption_intent_at', sevenDaysAgo);

  if (error) {
    console.error('[adoption-followup] query error', error);
    return res.status(500).json({ error: 'Erro ao consultar adoções pendentes.' });
  }

  if (!pending || pending.length === 0) {
    return res.status(200).json({ sent: 0, message: 'Nenhuma adoção pendente.' });
  }

  let sent = 0;
  const failures = [];

  for (const anuncio of pending) {
    const token      = anuncio.adoption_token;
    const confirmUrl = `${BASE_URL}/api/adoption-confirm?token=${token}`;
    const denyUrl    = `${BASE_URL}/api/adoption-deny?token=${token}`;
    const catName    = anuncio.nome_gato ?? 'o gatinho';
    const donorName  = anuncio.nome_doador ?? 'tutor';

    const emails = [];

    // E-mail para o adotante
    emails.push(
      resend.emails.send({
        from:     FROM,
        reply_to: REPLY_TO,
        to:       anuncio.email_adotante,
        subject:  `Lembrete: como foi a adoção de ${catName}? — LoveCats`,
        html:     followUpEmailHTML({ catName, donorName, confirmUrl, denyUrl, isAdopter: true }),
      })
    );

    // E-mail para o doador (se tiver email)
    if (anuncio.email) {
      emails.push(
        resend.emails.send({
          from:     FROM,
          reply_to: REPLY_TO,
          to:       anuncio.email,
          subject:  `Lembrete: ${catName} encontrou um lar? — LoveCats`,
          html:     followUpEmailHTML({ catName, donorName, confirmUrl, denyUrl, isAdopter: false }),
        })
      );
    }

    try {
      await Promise.all(emails);

      // Reset the 7-day clock so we don't spam on every run
      await supabaseAdmin
        .from('anuncios_doacao')
        .update({ adoption_intent_at: new Date().toISOString() })
        .eq('id', anuncio.id);

      sent++;
    } catch (emailErr) {
      console.error(`[adoption-followup] failed for anuncio ${anuncio.id}`, emailErr);
      failures.push(anuncio.id);
    }
  }

  return res.status(200).json({ sent, failures });
}
