import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const MAX_LIMIT    = 48;
const SUPABASE_URL = process.env.SUPABASE_URL            ?? '';
const FOTOS_BUCKET = process.env.STORAGE_BUCKET_FOTOS    ?? 'fotos-gatinhos';
const DOC_BUCKET   = process.env.STORAGE_BUCKET_DOCS     ?? 'documentos-doacao';
const DOC_EXPIRES  = 3600; // signed URL validity: 1 hour

function toPublicFotoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${FOTOS_BUCKET}/${path}`;
}

/**
 * GET /api/cats
 * Retorna anúncios disponíveis com todos os campos necessários para
 * a página de adoção, incluindo URLs públicas de fotos e URLs assinadas
 * (1h) para documentos veterinários.
 *
 * Query params (todos opcionais):
 *   cor, sexo, tipo_doador, vacinado, castrado, idoso, page, limit
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }

  const {
    cor,
    sexo,
    tipo_doador,
    vacinado,
    castrado,
    idoso,
    page     = '1',
    limit: rawLimit = String(MAX_LIMIT),
  } = req.query;

  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit, 10) || MAX_LIMIT));
  const from     = (pageNum - 1) * limitNum;
  const to       = from + limitNum - 1;

  let query = supabaseAdmin
    .from('anuncios_doacao')
    .select(
      'id, created_at, ' +
      'nome_gatinho, padrao_pelagem, sexo, idade, descricao, foto_url, ' +
      'tipo_doador, nome_doador, cidade, whatsapp, ong_link_contact, ' +
      'vacinado, doc_vacina_url, castrado, doc_castracao_url, ' +
      'vermifugado, microchip, testado_fiv_felv, socializavel, ' +
      'idoso, condicao_especial, condicao_especial_descricao, ' +
      'doc_protetor_url',
      { count: 'exact' }
    )
    .eq('status', 'disponivel')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (cor)         query = query.eq('padrao_pelagem', cor);
  if (sexo)        query = query.eq('sexo', sexo);
  if (tipo_doador) query = query.eq('tipo_doador', tipo_doador);
  if (vacinado !== undefined) query = query.eq('vacinado', vacinado === 'true');
  if (castrado !== undefined) query = query.eq('castrado', castrado === 'true');
  if (idoso    !== undefined) query = query.eq('idoso',    idoso    === 'true');

  const { data, error, count } = await query;

  if (error) {
    console.error('[cats] Supabase error:', error);
    return res.status(500).json({ error: 'Falha ao buscar anúncios' });
  }

  const rows = data ?? [];

  // Collect unique doc paths and sign them in one batch call
  const docPaths = [...new Set(
    rows.flatMap(c => [c.doc_vacina_url, c.doc_castracao_url, c.doc_protetor_url].filter(Boolean))
  )];

  const signedUrlMap = {};
  if (docPaths.length) {
    const { data: signed, error: signErr } = await supabaseAdmin
      .storage.from(DOC_BUCKET)
      .createSignedUrls(docPaths, DOC_EXPIRES);
    if (signErr) {
      console.warn('[cats] Erro ao assinar URLs de docs:', signErr.message);
    } else if (signed) {
      for (const s of signed) {
        if (s.signedUrl) signedUrlMap[s.path] = s.signedUrl;
      }
    }
  }

  const cats = rows.map(cat => ({
    ...cat,
    foto_url:          toPublicFotoUrl(cat.foto_url),
    doc_vacina_url:    signedUrlMap[cat.doc_vacina_url]    ?? null,
    doc_castracao_url: signedUrlMap[cat.doc_castracao_url] ?? null,
    doc_protetor_url:  signedUrlMap[cat.doc_protetor_url]  ?? null,
  }));

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  return res.status(200).json({ data: cats, total: count ?? 0, page: pageNum, limit: limitNum });
}

