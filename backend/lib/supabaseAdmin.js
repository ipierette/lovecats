import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    'SUPABASE_URL e SUPABASE_SECRET_KEY não definidas. ' +
    'Configure o arquivo .env na raiz do projeto ou as variáveis de ambiente do Vercel.'
  );
}

/**
 * Cliente Supabase com acesso de administrador (Secret key / service_role).
 * Use APENAS em funções de servidor — NUNCA exponha no frontend.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
