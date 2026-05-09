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

  // Busca o anúncio pelo token
  const { data: anuncio, error } = await supabaseAdmin
    .from('anuncios_doacao')
    .select('id, status')
    .eq('adoption_token', token)
    .single();

  if (error || !anuncio) {
    return res.redirect(302, `${BASE_URL}/adocao-nao-confirmada.html?error=notfound`);
  }

  // Limpa campos de adoção para que o gatinho fique disponível novamente
  if (anuncio.status === 'disponivel') {
    await supabaseAdmin
      .from('anuncios_doacao')
      .update({
        email_adotante:     null,
        adoption_token:     null,
        adoption_intent_at: null,
      })
      .eq('id', anuncio.id);
  }

  return res.redirect(302, `${BASE_URL}/adocao-nao-confirmada.html`);
}
