-- =============================================================================
-- MIGRAÇÃO: Tabela adoption_intents
-- =============================================================================
-- Execute no Supabase Dashboard > SQL Editor
--
-- Problema anterior: os campos email_adotante, adoption_token e
-- adoption_intent_at ficavam diretamente em anuncios_doacao, tornando
-- impossível registrar mais de um interessado por anúncio simultaneamente.
--
-- Solução: tabela separada onde cada linha representa o interesse de um
-- adotante por um anúncio. Cada linha tem seu próprio token de confirmação,
-- então o doador pode confirmar/negar por adotante individualmente.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Criar tabela
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS adoption_intents (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  anuncio_id       uuid        NOT NULL REFERENCES anuncios_doacao(id) ON DELETE CASCADE,
  email_adotante   text        NOT NULL,
  adoption_token   text        NOT NULL UNIQUE,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'confirmed', 'denied')),
  created_at       timestamptz NOT NULL DEFAULT now(),

  -- Impede que o mesmo email se registre duas vezes para o mesmo anuncio
  CONSTRAINT uq_intent_anuncio_email UNIQUE (anuncio_id, email_adotante)
);


-- -----------------------------------------------------------------------------
-- 2. Índices
-- -----------------------------------------------------------------------------

-- Busca rápida por token (adoption-confirm / adoption-deny)
CREATE INDEX IF NOT EXISTS idx_intents_token
  ON adoption_intents(adoption_token);

-- Listar todos os interessados em um anúncio
CREATE INDEX IF NOT EXISTS idx_intents_anuncio
  ON adoption_intents(anuncio_id);


-- -----------------------------------------------------------------------------
-- 3. RLS — Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE adoption_intents ENABLE ROW LEVEL SECURITY;

-- A service_role (back-end) ignora RLS por padrão — sem política adicional
-- necessária para o back-end.
-- Sem política SELECT pública: adotantes não podem ver dados de outros.


-- -----------------------------------------------------------------------------
-- 4. (Opcional) Remover colunas legadas de anuncios_doacao
-- -----------------------------------------------------------------------------
-- Se já existirem essas colunas da versão anterior, você pode removê-las
-- após validar que a migração funcionou em produção.
-- CUIDADO: faça backup antes.
--
-- ALTER TABLE anuncios_doacao
--   DROP COLUMN IF EXISTS email_adotante,
--   DROP COLUMN IF EXISTS adoption_token,
--   DROP COLUMN IF EXISTS adoption_intent_at;
