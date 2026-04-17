import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT     = 48;

const SUPABASE_URL   = process.env.SUPABASE_URL   ?? '';
const FOTOS_BUCKET   = process.env.STORAGE_BUCKET_FOTOS ?? 'fotos-gatinhos';

/** Converte o path relativo do Storage em URL pública. */
function toPublicUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${FOTOS_BUCKET}/${path}`;
}

/**
 * GET /api/cats
 * Retorna os anúncios com status='disponivel', paginados e filtráveis.
 *
 * Query params:
 *   cidade    string  — filtra por cidade (case-insensitive, contains)
 *   sexo      string  — 'Macho' ou 'Fêmea'
 *   castrado  bool    — 'true' ou 'false'
 *   vacinado  bool    — 'true' ou 'false'
 *   page      number  — página (default 1)
 *   limit     number  — por página (default 12, máx 48)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cidade, sexo, castrado, vacinado, page = '1', limit: rawLimit = String(DEFAULT_LIMIT) } = req.query;

  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit, 10) || DEFAULT_LIMIT));
  const from     = (pageNum - 1) * limitNum;
  const to       = from + limitNum - 1;

  let query = supabaseAdmin
    .from('anuncios_doacao')
    .select(
      'id, nome_gatinho, padrao_pelagem, sexo, idade, descricao, foto_url, ' +
      'cidade, castrado, vacinado, bom_com_criancas, aceita_outros_animais, criado_em',
      { count: 'exact' }
    )
    .eq('status', 'disponivel')
    .order('criado_em', { ascending: false })
    .range(from, to);

  if (cidade)    query = query.ilike('cidade', `%${cidade}%`);
  if (sexo)      query = query.eq('sexo', sexo);
  if (castrado  !== undefined) query = query.eq('castrado',  castrado  === 'true');
  if (vacinado  !== undefined) query = query.eq('vacinado',  vacinado  === 'true');

  const { data, error, count } = await query;

  if (error) {
    console.error('[cats] Supabase error:', error);
    return res.status(500).json({ error: 'Falha ao buscar anúncios' });
  }

  const cats = (data ?? []).map(cat => ({ ...cat, foto_url: toPublicUrl(cat.foto_url) }));

  return res.status(200).json({ data: cats, total: count ?? 0, page: pageNum, limit: limitNum });
}
