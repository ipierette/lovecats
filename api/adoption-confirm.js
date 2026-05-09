import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const BASE_URL = (process.env.BASE_URL ?? 'https://lovecats.com.br').replace(/\/$/, '');

/**
 * GET /api/adoption-confirm?token=<hex>
 * Marca o anúncio como 'adotado' e redireciona para a página de parabéns.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }

  const { token } = req.query;
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return res.redirect(302, `${BASE_URL}/adocao-confirmada.html?error=token`);
  }

  // Busca o intent pelo token
  const { data: intent, error } = await supabaseAdmin
    .from('adoption_intents')
    .select('id, anuncio_id, status')
    .eq('adoption_token', token)
    .single();

  if (error || !intent) {
    return res.redirect(302, `${BASE_URL}/adocao-confirmada.html?error=notfound`);
  }

  // Marca o intent como confirmado
  await supabaseAdmin
    .from('adoption_intents')
    .update({ status: 'confirmed' })
    .eq('id', intent.id);

  // Marca o anúncio como adotado (idempotente)
  await supabaseAdmin
    .from('anuncios_doacao')
    .update({ status: 'adotado' })
    .eq('id', intent.anuncio_id)
    .neq('status', 'adotado');

  return res.redirect(302, `${BASE_URL}/adocao-confirmada.html`);
}
