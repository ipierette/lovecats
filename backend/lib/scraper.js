import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const TIMEOUT_MS  = 10_000;
const USER_AGENT  = 'LoveCats-AdoptionBot/1.0 (+https://lovecats.com.br)';

const ADOPTION_KEYWORDS = [
  'adotado', 'adotada', 'adoção realizada', 'já tem lar',
  'encontrou lar', 'inativo', 'indisponível', 'removido',
];

// ---------------------------------------------------------------------------
// Proteção SSRF — bloqueia IPs internos e protocolos não-HTTP
// ---------------------------------------------------------------------------

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^0\./,
  /^169\.254\./,  // link-local
  /^fd[0-9a-f]{2}:/i, // IPv6 ULA
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

// ---------------------------------------------------------------------------
// Raspador principal
// ---------------------------------------------------------------------------

/**
 * Verifica se a página de contato de uma ONG ainda lista o gatinho.
 *
 * @param {string} ongUrl       - URL do campo ong_link_contact
 * @param {string} nomeGatinho  - Nome do gatinho (para buscar na página)
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

  // Página indisponível → assume adotado / removido
  if (!res.ok) return 'adotado';

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove scripts/styles para evitar falsos positivos em código-fonte
  $('script, style').remove();
  const text = $.text().toLowerCase();

  if (ADOPTION_KEYWORDS.some(kw => text.includes(kw))) return 'adotado';

  // Se o nome do gatinho não aparece mais na página, provavelmente foi adotado
  if (nomeGatinho && !text.includes(nomeGatinho.toLowerCase())) return 'adotado';

  return 'disponivel';
}
