import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { checkOngPage }  from './_lib/scraper.js';

const HMAC_SECRET  = process.env.HMAC_SECRET ?? '';
const TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

function signToken(id, status, timestamp) {
  return createHmac('sha256', HMAC_SECRET)
    .update(`${id}:${status}:${timestamp}`)
    .digest('hex');
}

function verifyToken(id, status, timestamp, token) {
  const expected = signToken(id, status, timestamp);
  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// GET — clique no link do e-mail enviado ao doador
async function handleGet(req, res) {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }
  const { id, status, ts, token } = req.query;
  if (!id || !status || !ts || !token) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }
  if (!['adotado', 'disponivel'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  const timestamp = parseInt(ts, 10);
  if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_TTL_MS) {
    return res.status(400).json({ error: 'Link expirado — aguarde o próximo e-mail semanal' });
  }
  if (!verifyToken(id, status, timestamp, token)) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  const { error } = await supabaseAdmin
    .from('anuncios_doacao')
    .update({ status })
    .eq('id', id);
  if (error) {
    console.error('[adoption-check] Erro ao atualizar status:', error);
    return res.status(500).json({ error: 'Falha ao atualizar status' });
  }
  const message = status === 'adotado'
    ? 'Que alegria! Status atualizado para adotado. 🐱'
    : 'Combinado! Voltaremos a perguntar na próxima semana.';
  return res.status(200).json({ message });
}

// POST — cron do Vercel (toda segunda-feira), varre páginas de ONGs
async function handlePost(req, res) {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado.' });
  }
  const authHeader = req.headers.authorization ?? '';
  if (authHeader !== `Bearer ${HMAC_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  const { data: ongs, error: fetchErr } = await supabaseAdmin
    .from('anuncios_doacao')
    .select('id, nome_gatinho, ong_link_contact')
    .eq('status', 'disponivel')
    .eq('tipo_doador', 'ong')
    .not('ong_link_contact', 'is', null);
  if (fetchErr) {
    console.error('[adoption-check] Falha ao buscar ONGs:', fetchErr);
    return res.status(500).json({ error: 'Erro ao buscar anúncios de ONGs' });
  }
  const results = [];
  for (const ad of ongs ?? []) {
    let scrapeStatus;
    try {
      scrapeStatus = await checkOngPage(ad.ong_link_contact, ad.nome_gatinho);
    } catch (err) {
      scrapeStatus = 'erro';
      console.warn(`[adoption-check] Scrape falhou para ${ad.id}:`, err.message);
    }
    if (scrapeStatus === 'adotado') {
      await supabaseAdmin
        .from('anuncios_doacao')
        .update({ status: 'adotado' })
        .eq('id', ad.id);
    }
    results.push({ id: ad.id, resultado: scrapeStatus });
  }
  // TODO (Fase 3): enviar e-mails de confirmação para doadores individuais.
  return res.status(200).json({ processados: results.length, results });
}

export default async function handler(req, res) {
  if (req.method === 'GET')  return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  return res.status(405).json({ error: 'Método não permitido' });
}

