import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const BASE_URL = (process.env.BASE_URL ?? 'https://lovecats.com.br').replace(/\/$/, '');

/**
 * GET /api/adoption-deny?token=<hex>
 * Mantém o anúncio como 'disponivel', limpa os campos de adoção e
 * redireciona para a página de adoção não confirmada.
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
    return res.redirect(302, `${BASE_URL}/adocao-nao-confirmada.html?error=token`);
  }

  // Busca o intent pelo token
  const { data: intent, error } = await supabaseAdmin
    .from('adoption_intents')
    .select('id, status')
    .eq('adoption_token', token)
    .single();

  if (error || !intent) {
    return res.redirect(302, `${BASE_URL}/adocao-nao-confirmada.html?error=notfound`);
  }

  // Marca o intent como negado — o anúncio permanece 'disponivel'
  await supabaseAdmin
    .from('adoption_intents')
    .update({ status: 'denied' })
    .eq('id', intent.id);

  return res.redirect(302, `${BASE_URL}/adocao-nao-confirmada.html`);
}
