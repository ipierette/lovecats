import { randomBytes }   from 'crypto';
import nodemailer         from 'nodemailer';
import { supabaseAdmin }  from './_lib/supabaseAdmin.js';

// ── Gmail SMTP transporter ───────────────────────────────────
// Usa a conta Gmail dedicada do projeto (nao exige dominio verificado).
// Configure EMAIL_USER e EMAIL_APP_PASSWORD na Vercel e no .env local.
// Gere um App Password em: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const FROM     = `LoveCats <${process.env.EMAIL_USER ?? 'lovecats.doacao@gmail.com'}>`;
const REPLY_TO = process.env.REPLY_TO_EMAIL ?? 'equipelovecats@gmail.com';
const BASE_URL = (process.env.BASE_URL ?? 'https://lovecats.vercel.app').replace(/\/$/, '');

// ── Email template ───────────────────────────────────────────
function adoptionEmailHTML({ catName, donorName, confirmUrl, denyUrl, isAdopter }) {
  const headline = isAdopter
    ? `Voc\u00ea demonstrou interesse em adotar <strong>${catName}</strong>! 🐱`
    : `<strong>${catName}</strong> pode ter encontrado um lar amoroso! 🏠`;

  const intro = isAdopter
    ? `Ol\u00e1! Registramos seu interesse em adotar <strong>${catName}</strong>. Adorar\u00edamos saber como foi o processo \u2014 sua resposta nos ajuda a melhorar a plataforma e a garantir que todos os gatinhos encontrem lares seguros.`
    : `Ol\u00e1, <strong>${donorName}</strong>! Um adotante demonstrou interesse em <strong>${catName}</strong> pela plataforma LoveCats. Por favor, nos informe se a ado\u00e7\u00e3o foi conclu\u00edda.`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${isAdopter ? 'Interesse em adoção registrado' : 'Atualização de adoção'} — LoveCats</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1c1815;padding:24px 32px;text-align:center;">
              <img
                src="${BASE_URL}/src/images/logo-icone.png"
                alt="LoveCats"
                width="36"
                height="36"
                style="display:inline-block;vertical-align:middle;margin-right:10px;"
              />
              <span style="display:inline-block;vertical-align:middle;font-size:22px;font-weight:700;color:#e07535;letter-spacing:-0.01em;">LoveCats</span>
            </td>
          </tr>

          <!-- Orange top accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#e07535 0%,#f08545 100%);height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 24px;">
              <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1c1815;line-height:1.35;">${headline}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#4a3f35;line-height:1.7;">${intro}</p>

              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#7a6858;text-transform:uppercase;letter-spacing:0.07em;">A adoção foi confirmada?</p>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-right:10px;">
                    <a
                      href="${confirmUrl}"
                      style="display:inline-block;background:#e07535;color:#ffffff;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;"
                    >✓ Sim, foi adotado!</a>
                  </td>
                  <td>
                    <a
                      href="${denyUrl}"
                      style="display:inline-block;background:#f5f0ea;color:#4a3f35;border:1px solid #d4c5b5;font-size:15px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;"
                    >✕ Não, ainda disponível</a>
                  </td>
                </tr>
              </table>

              <div style="background:#faf7f4;border:1px solid #e8dfd5;border-radius:8px;padding:14px 18px;font-size:13px;color:#7a6858;line-height:1.6;">
                <strong style="display:block;margin-bottom:4px;color:#4a3f35;">Por que estamos perguntando?</strong>
                A LoveCats envia um e-mail de acompanhamento para ajudar a manter os anúncios atualizados. Ao confirmar a adoção, o anúncio é automaticamente marcado como <em>adotado</em>. Caso a adoção não tenha ocorrido, o gatinho continua disponível para adoção.
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
 * POST /api/adoption-intent
 * Body: { anuncio_id, email_adotante }
 *
 * 1. Salva email_adotante e token único no anúncio
 * 2. Envia email via Resend para adotante (e doador se tiver email)
 * 3. Retorna 200 para o front; erros não bloqueiam o fluxo do adotante
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }

  const { anuncio_id, email_adotante } = req.body ?? {};

  if (!anuncio_id) {
    return res.status(400).json({ error: 'anuncio_id é obrigatório.' });
  }
  if (!email_adotante || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email_adotante).trim())) {
    return res.status(400).json({ error: 'E-mail do adotante inválido.' });
  }

  // Busca o anúncio para obter dados do gatinho e do doador
  const { data: anuncio, error: fetchErr } = await supabaseAdmin
    .from('anuncios_doacao')
    .select('id, nome_gatinho, nome_doador, email, status')
    .eq('id', anuncio_id)
    .single();

  if (fetchErr || !anuncio) {
    console.error('[adoption-intent] anúncio não encontrado:', fetchErr);
    return res.status(404).json({ error: 'Anúncio não encontrado.' });
  }
  if (anuncio.status !== 'disponivel') {
    return res.status(409).json({ error: 'Este gatinho já foi adotado.' });
  }

  // Gera token criptograficamente seguro (64 chars hex)
  const token = randomBytes(32).toString('hex');

  // Registra o interesse numa linha própria da tabela adoption_intents.
  // Dessa forma múltiplos adotantes podem se interessar pelo mesmo anúncio
  // sem sobrescrever os dados uns dos outros.
  const { error: insertErr } = await supabaseAdmin
    .from('adoption_intents')
    .insert({
      anuncio_id:    anuncio_id,
      email_adotante: email_adotante.trim(),
      adoption_token: token,
      status:         'pending',
    });

  if (insertErr) {
    // Código 23505 = unique_violation: mesmo email já se registrou para este anúncio
    if (insertErr.code === '23505') {
      return res.status(409).json({ error: 'Você já registrou interesse neste gatinho. Verifique seu e-mail!' });
    }
    console.error('[adoption-intent] Erro ao salvar intent:', insertErr);
    return res.status(500).json({ error: 'Erro interno ao registrar interesse.' });
  }

  const catName    = anuncio.nome_gatinho ?? 'o gatinho';
  const donorName  = anuncio.nome_doador  ?? 'Doador';
  const confirmUrl = `${BASE_URL}/api/adoption-confirm?token=${token}`;
  const denyUrl    = `${BASE_URL}/api/adoption-deny?token=${token}`;

  // Envia emails via Gmail SMTP (nodemailer).
  // Nao exige dominio verificado — funciona com qualquer conta Gmail + App Password.
  const sendEmail = async ({ to, subject, html, label }) => {
    try {
      const info = await transporter.sendMail({ from: FROM, replyTo: REPLY_TO, to, subject, html });
      console.log(`[adoption-intent] Email ${label} enviado: ${info.messageId}`);
    } catch (err) {
      console.warn(`[adoption-intent] Falha ao enviar email ${label}:`, err.message);
    }
  };

  await Promise.allSettled([
    sendEmail({
      to:      email_adotante.trim(),
      subject: `Seu interesse em adotar ${catName} foi registrado! 🐱`,
      html:    adoptionEmailHTML({ catName, donorName, confirmUrl, denyUrl, isAdopter: true }),
      label:   'adotante',
    }),
    ...(anuncio.email ? [sendEmail({
      to:      anuncio.email,
      subject: `${catName} pode ter encontrado um lar! Confirme a adoção 🏠`,
      html:    adoptionEmailHTML({ catName, donorName, confirmUrl, denyUrl, isAdopter: false }),
      label:   'doador',
    })] : []),
  ]);

  return res.status(200).json({ ok: true });
}
