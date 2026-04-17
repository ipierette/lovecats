import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const TIMEOUT_MS  = 10_000;
const USER_AGENT  = 'LoveCats-AdoptionBot/1.0 (+https://lovecats.com.br)';

const ADOPTION_KEYWORDS = [
  'adotado', 'adotada', 'adoção realizada', 'já tem lar',
  'encontrou lar', 'inativo', 'indisponível', 'removido',
];

// Proteção SSRF — bloqueia IPs internos e protocolos não-HTTP
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^0\./,
  /^169\.254\./,
  /^fd[0-9a-f]{2}:/i,
];

function validateOngUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(`URL inválida: ${rawUrl}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Protocolo não permitido: ${url.protocol}`);
  }
  const host = url.hostname.toLowerCase();
  if (PRIVATE_IP_PATTERNS.some(p => p.test(host))) {
    throw new Error(`Host bloqueado (endereço interno): ${host}`);
  }
  return url;
}

/**
 * Verifica se a página de contato de uma ONG ainda lista o gatinho.
 * @returns {Promise<'adotado'|'disponivel'|'erro'>}
 */
export async function checkOngPage(ongUrl, nomeGatinho) {
  validateOngUrl(ongUrl);
  let res;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    res = await fetch(ongUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
    });
    clearTimeout(timer);
  } catch (err) {
    console.warn(`[scraper] Falha ao acessar ${ongUrl}:`, err.message);
    return 'erro';
  }
  if (!res.ok) return 'adotado';
  const html = await res.text();
  const $ = cheerio.load(html);
  $('script, style').remove();
  const text = $.text().toLowerCase();
  if (ADOPTION_KEYWORDS.some(kw => text.includes(kw))) return 'adotado';
  if (nomeGatinho && !text.includes(nomeGatinho.toLowerCase())) return 'adotado';
  return 'disponivel';
}
