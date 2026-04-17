import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com acesso de administrador (service_role).
 * Retorna null se as variáveis de ambiente não estiverem configuradas —
 * cada handler verifica o null e retorna 503 com mensagem clara,
 * evitando que o módulo trave na inicialização com um erro opaco.
 */
export const supabaseAdmin = (() => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('[supabaseAdmin] SUPABASE_URL ou SUPABASE_SECRET_KEY não definidas.');
    return null;
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
})();
