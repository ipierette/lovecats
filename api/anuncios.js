import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { AnuncioSchema }  from './_lib/schemas.js';

/**
 * POST /api/anuncios
 * Cria um novo anúncio de doação de gatinho.
 * O anúncio é criado com status='pendente_email' até o doador confirmar pelo e-mail.
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

  const { data, error } = await supabaseAdmin
    .from('anuncios_doacao')
    .insert({ ...parsed.data, status: 'pendente_email' })
    .select('id')
    .single();

  if (error) {
    console.error('[anuncios] Supabase error:', error);
    return res.status(500).json({ error: 'Falha ao criar anúncio' });
  }

  // TODO (Fase 3): disparar e-mail de verificação para o doador.
  return res.status(201).json({ id: data.id });
}

