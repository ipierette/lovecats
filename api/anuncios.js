import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { AnuncioSchema }  from './_lib/schemas.js';

/**
 * POST /api/anuncios
 * Cria um novo anúncio de doação de gatinho com status 'disponivel' (default do DB).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Banco de dados não configurado. Verifique SUPABASE_URL e SUPABASE_SECRET_KEY nas variáveis de ambiente do Vercel.' });
  }

  console.log('[anuncios] req.body:', JSON.stringify(req.body));
  const parsed = AnuncioSchema.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    console.error('[anuncios] Zod validation error:', JSON.stringify(flat));
    return res.status(400).json({ error: flat });
  }

  const d = parsed.data;

  // Mapeia os nomes do frontend/Zod para os nomes reais das colunas do banco.
  // microchipado → microchip | fiv_felv → testado_fiv_felv | especial_desc → condicao_especial_descricao
  const record = {
    nome_gatinho:                d.nome_gatinho,
    padrao_pelagem:              d.padrao_pelagem,
    sexo:                        d.sexo,
    idade:                       d.idade,
    descricao:                   d.descricao                ?? null,
    foto_url:                    d.foto_url                 ?? null,
    tipo_doador:                 d.tipo_doador,
    nome_doador:                 d.nome_doador,
    cidade:                      d.cidade,
    whatsapp:                    d.whatsapp                 ?? null,
    email:                       d.email                    ?? '',
    ong_link_contact:            d.ong_link_contact         ?? null,
    doc_protetor_url:            d.doc_protetor_url         ?? null,
    vacinado:                    d.vacinado,
    doc_vacina_url:              d.doc_vacina_url           ?? null,
    castrado:                    d.castrado,
    doc_castracao_url:           d.doc_castracao_url        ?? null,
    vermifugado:                 d.vermifugado,
    microchip:                   d.microchipado,
    testado_fiv_felv:            d.fiv_felv,
    aceita_outros_animais:       d.aceita_outros_animais,
    idoso:                       d.idoso,
    condicao_especial:           d.condicao_especial,
    condicao_especial_descricao: d.especial_desc            ?? null,
  };

  const { data, error } = await supabaseAdmin
    .from('anuncios_doacao')
    .insert(record)           // status usa o default 'disponivel' definido no DB
    .select('id')
    .single();

  if (error) {
    console.error('[anuncios] Supabase error:', error);
    return res.status(500).json({ error: 'Falha ao criar anúncio' });
  }

  // TODO (Fase 3): disparar e-mail de verificação para o doador.
  return res.status(201).json({ id: data.id });
}

