import { supabaseAdmin } from './_lib/supabaseAdmin.js';

/**
 * GET /api/metrics
 * Retorna contagens de anúncios para o painel de métricas da Home.
 * Resposta: { adotados, disponiveis, adotados_mes }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }

  // Início do mês atual (UTC)
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [adotadosRes, disponiveisRes, mesRes] = await Promise.all([
    supabaseAdmin
      .from('anuncios_doacao')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'adotado'),

    supabaseAdmin
      .from('anuncios_doacao')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'disponivel'),

    supabaseAdmin
      .from('anuncios_doacao')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'adotado')
      .gte('updated_at', startOfMonth),
  ]);

  const adotados    = adotadosRes.count    ?? 0;
  const disponiveis = disponiveisRes.count ?? 0;
  const adotados_mes = mesRes.count        ?? 0;

  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  return res.status(200).json({ adotados, disponiveis, adotados_mes });
}
