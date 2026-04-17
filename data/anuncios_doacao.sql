-- =============================================================================
-- LOVECATS - Tabela de Anúncios de Doação de Gatos
-- =============================================================================
-- Este arquivo contém a estrutura completa da tabela PostgreSQL para o Supabase
-- que armazenará os dados do formulário de anúncio de doação.
--
-- Características:
-- • Campos para todas as informações do formulário
-- • URLs do Supabase Storage para imagens e documentos
-- • Coluna de status (disponivel/adotado)
-- • Políticas RLS (Row Level Security) configuradas
-- • Triggers automáticos para updated_at
-- • Índices para otimização de queries
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
-- Habilitar extensão UUID (caso não esteja habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 2. ENUMS
-- -----------------------------------------------------------------------------

-- Tipos ENUM para campos categóricos
CREATE TYPE padrao_pelagem AS ENUM (
  'solido',
  'tigrado',
  'bicolor',
  'tricolor',
  'tartaruga',
  'colorpoint'
);

CREATE TYPE sexo_gato AS ENUM (
  'Macho',
  'Fêmea'
);

CREATE TYPE tipo_doador AS ENUM (
  'resgate-informal',
  'protetor-registrado',
  'ong'
);

CREATE TYPE status_anuncio AS ENUM (
  'disponivel',
  'adotado'
);

-- -----------------------------------------------------------------------------
-- 3. TABELA PRINCIPAL
-- -----------------------------------------------------------------------------

CREATE TABLE anuncios_doacao (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Status do anúncio
  status status_anuncio DEFAULT 'disponivel' NOT NULL,
  
  -- -------------------------
  -- INFORMAÇÕES DO GATINHO
  -- -------------------------
  nome_gatinho VARCHAR(100) NOT NULL,
  padrao_pelagem padrao_pelagem NOT NULL,
  sexo sexo_gato NOT NULL,
  idade VARCHAR(50) NOT NULL,
  descricao TEXT,
  
  -- Foto (URL do Supabase Storage - 1 foto por anúncio)
  foto_url TEXT,
  
  -- -------------------------
  -- TIPO DE DOADOR
  -- -------------------------
  tipo_doador tipo_doador NOT NULL,
  
  -- Documento do protetor registrado (URL do Supabase Storage)
  doc_protetor_url TEXT,
  
  -- -------------------------
  -- CONTATO DO DOADOR
  -- -------------------------
  nome_doador VARCHAR(200) NOT NULL,
  cidade VARCHAR(200) NOT NULL,
  whatsapp VARCHAR(20),
  ong_link_contact TEXT,
  email VARCHAR(255) NOT NULL,
  
  -- -------------------------
  -- SAÚDE
  -- -------------------------
  vacinado BOOLEAN DEFAULT FALSE,
  doc_vacina_url TEXT,
  
  castrado BOOLEAN DEFAULT FALSE,
  doc_castracao_url TEXT,
  
  vermifugado BOOLEAN DEFAULT FALSE,
  microchip BOOLEAN DEFAULT FALSE,
  testado_fiv_felv BOOLEAN DEFAULT FALSE,
  socializavel BOOLEAN DEFAULT FALSE,
  
  -- Tags especiais
  idoso BOOLEAN DEFAULT FALSE,
  condicao_especial BOOLEAN DEFAULT FALSE,
  condicao_especial_descricao VARCHAR(100),
  
  -- -------------------------
  -- METADADOS
  -- -------------------------
  -- User ID do Supabase Auth (opcional para rastreamento)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Contador de visualizações
  visualizacoes INTEGER DEFAULT 0,
  
  -- Data da última confirmação de disponibilidade (para email semanal)
  ultima_confirmacao TIMESTAMP WITH TIME ZONE,
  
  -- Verificações
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT doc_protetor_required CHECK (
    (tipo_doador != 'protetor-registrado') OR (doc_protetor_url IS NOT NULL)
  ),
  -- ONGs são isentas de comprovação documental veterinária
  CONSTRAINT doc_vacina_required CHECK (
    (vacinado = FALSE) OR (tipo_doador = 'ong') OR (doc_vacina_url IS NOT NULL)
  ),
  CONSTRAINT doc_castracao_required CHECK (
    (castrado = FALSE) OR (tipo_doador = 'ong') OR (doc_castracao_url IS NOT NULL)
  ),
  CONSTRAINT condicao_especial_desc_required CHECK (
    (condicao_especial = FALSE) OR (condicao_especial_descricao IS NOT NULL)
  )
);

-- -----------------------------------------------------------------------------
-- 4. ÍNDICES
-- -----------------------------------------------------------------------------

-- Índice para status (queries mais comuns)
CREATE INDEX idx_anuncios_status ON anuncios_doacao(status);

-- Índice para data de criação (ordenação)
CREATE INDEX idx_anuncios_created_at ON anuncios_doacao(created_at DESC);

-- Índice para tipo de doador
CREATE INDEX idx_anuncios_tipo_doador ON anuncios_doacao(tipo_doador);

-- Índice para cidade (busca por localização)
CREATE INDEX idx_anuncios_cidade ON anuncios_doacao(cidade);

-- Índice composto para queries comuns (status + data)
CREATE INDEX idx_anuncios_status_created ON anuncios_doacao(status, created_at DESC);

-- Índice para user_id (se usando autenticação)
CREATE INDEX idx_anuncios_user_id ON anuncios_doacao(user_id) WHERE user_id IS NOT NULL;

-- Índice para última confirmação (email semanal)
CREATE INDEX idx_anuncios_ultima_confirmacao ON anuncios_doacao(ultima_confirmacao) 
  WHERE tipo_doador IN ('protetor-registrado', 'ong');

-- -----------------------------------------------------------------------------
-- 5. TRIGGER PARA UPDATED_AT
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_anuncios_updated_at
  BEFORE UPDATE ON anuncios_doacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Habilitar RLS na tabela
ALTER TABLE anuncios_doacao ENABLE ROW LEVEL SECURITY;

-- Política 1: Leitura pública de anúncios disponíveis
-- Qualquer pessoa pode ver anúncios com status "disponivel"
CREATE POLICY "Leitura pública de anúncios disponíveis"
  ON anuncios_doacao
  FOR SELECT
  USING (status = 'disponivel');


-- Política 3: Inserção pública (qualquer pessoa pode criar anúncio)
-- Permite que tanto usuários anônimos quanto autenticados criem anúncios
CREATE POLICY "Criação pública de anúncios"
  ON anuncios_doacao
  FOR INSERT
  WITH CHECK (true);

-- Política 4: Atualização apenas pelo proprietário
-- Apenas o usuário que criou pode atualizar (se autenticado)
CREATE POLICY "Proprietário pode atualizar anúncio"
  ON anuncios_doacao
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política 5: Deleção apenas pelo proprietário
-- Apenas o usuário que criou pode deletar (se autenticado)
CREATE POLICY "Proprietário pode deletar anúncio"
  ON anuncios_doacao
  FOR DELETE
  USING (auth.uid() = user_id);

-- Política 6: Admins podem fazer tudo (role = 'admin' no JWT)
-- Administradores do sistema podem gerenciar todos os anúncios
CREATE POLICY "Administradores têm acesso total"
  ON anuncios_doacao
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS (Comandos para configurar no Supabase Dashboard)
-- -----------------------------------------------------------------------------

-- NOTA: Execute estes comandos no Supabase Dashboard > Storage
-- ou via SQL Editor:


-- Bucket para fotos dos gatinhos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-gatinhos', 'fotos-gatinhos', true);

-- Bucket para documentos (privado por segurança)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-doacao', 'documentos-doacao', false);

-- Políticas de Storage para fotos (público)
CREATE POLICY "Upload público de fotos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'fotos-gatinhos');

CREATE POLICY "Leitura pública de fotos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'fotos-gatinhos');

CREATE POLICY "Proprietário pode deletar fotos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'fotos-gatinhos' AND auth.uid() = owner);

-- Políticas de Storage para documentos (privado)
CREATE POLICY "Upload autenticado de documentos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documentos-doacao' AND auth.role() = 'authenticated');

CREATE POLICY "Leitura autenticada de documentos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documentos-doacao' AND (auth.uid() = owner OR auth.jwt() ->> 'role' = 'admin'));

CREATE POLICY "Proprietário pode deletar documentos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documentos-doacao' AND auth.uid() = owner);
*/

-- -----------------------------------------------------------------------------
-- 8. FUNÇÕES AUXILIARES
-- -----------------------------------------------------------------------------

-- Função para incrementar visualizações de forma segura
CREATE OR REPLACE FUNCTION increment_visualizacoes(anuncio_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE anuncios_doacao
  SET visualizacoes = visualizacoes + 1
  WHERE id = anuncio_id AND status = 'disponivel';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar anúncios com filtros
CREATE OR REPLACE FUNCTION buscar_anuncios(
  p_cidade TEXT DEFAULT NULL,
  p_sexo sexo_gato DEFAULT NULL,
  p_idade_max INTEGER DEFAULT NULL,
  p_castrado BOOLEAN DEFAULT NULL,
  p_vacinado BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF anuncios_doacao AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM anuncios_doacao
  WHERE status = 'disponivel'
    AND (p_cidade IS NULL OR cidade ILIKE '%' || p_cidade || '%')
    AND (p_sexo IS NULL OR sexo = p_sexo)
    AND (p_castrado IS NULL OR castrado = p_castrado)
    AND (p_vacinado IS NULL OR vacinado = p_vacinado)
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar status para "adotado"
CREATE OR REPLACE FUNCTION marcar_como_adotado(anuncio_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE anuncios_doacao
  SET status = 'adotado'
  WHERE id = anuncio_id 
    AND (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  RETURNING 1 INTO updated_count;
  
  RETURN COALESCE(updated_count, 0) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 9. VIEWS ÚTEIS
-- -----------------------------------------------------------------------------

-- View para estatísticas gerais
DROP VIEW IF EXISTS stats_anuncios;
CREATE VIEW stats_anuncios AS
SELECT
  COUNT(CASE WHEN status = 'disponivel' THEN 1 END)                              AS total_disponiveis,
  COUNT(CASE WHEN status = 'adotado'    THEN 1 END)                              AS total_adotados,
  COUNT(
    CASE WHEN status = 'adotado'
          AND updated_at >= date_trunc('month', NOW())
    THEN 1 END
  )                                                                               AS adocoes_mes_atual,
  COUNT(CASE WHEN tipo_doador = 'ong'                THEN 1 END)                 AS total_ongs,
  COUNT(CASE WHEN tipo_doador = 'protetor-registrado' THEN 1 END)                AS total_protetores,
  COUNT(CASE WHEN vacinado = true  THEN 1 END)                                   AS total_vacinados,
  COUNT(CASE WHEN castrado = true  THEN 1 END)                                   AS total_castrados,
  SUM(visualizacoes)                                                              AS total_visualizacoes
FROM anuncios_doacao;

-- View para anúncios em destaque (mais recentes e disponíveis)
CREATE OR REPLACE VIEW anuncios_destaque AS
SELECT 
  id,
  nome_gatinho,
  padrao_pelagem,
  sexo,
  idade,
  cidade,
  foto_url,
  vacinado,
  castrado,
  created_at,
  visualizacoes
FROM anuncios_doacao
WHERE status = 'disponivel'
ORDER BY created_at DESC
LIMIT 6;

-- -----------------------------------------------------------------------------
-- 10. COMENTÁRIOS NA TABELA
-- -----------------------------------------------------------------------------

COMMENT ON TABLE anuncios_doacao IS 'Armazena anúncios de doação de gatos. Integrado com Supabase Storage para imagens e documentos.';
COMMENT ON COLUMN anuncios_doacao.status IS 'Status do anúncio: disponivel ou adotado (padrão: disponivel)';
COMMENT ON COLUMN anuncios_doacao.foto_url IS 'URL pública da foto no Supabase Storage (bucket: fotos-gatinhos)';
COMMENT ON COLUMN anuncios_doacao.doc_protetor_url IS 'URL privada do documento no Supabase Storage (bucket: documentos-doacao)';
COMMENT ON COLUMN anuncios_doacao.doc_vacina_url IS 'URL privada da caderneta de vacinação (bucket: documentos-doacao)';
COMMENT ON COLUMN anuncios_doacao.doc_castracao_url IS 'URL privada do atestado de castração (bucket: documentos-doacao)';
COMMENT ON COLUMN anuncios_doacao.ultima_confirmacao IS 'Última data de confirmação de disponibilidade via email (para protetores e ONGs)';

-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================

-- INSTRUÇÕES DE USO:
-- 1. Execute este script no SQL Editor do Supabase Dashboard
-- 2. Configure os Storage Buckets (seção 7)
-- 3. Configure políticas de Storage (seção 7)
-- 4. Teste com alguns inserts de exemplo:
--
-- INSERT INTO anuncios_doacao (
--   nome_gatinho, padrao_pelagem, sexo, idade, descricao,
--   tipo_doador, nome_doador, cidade, whatsapp, email
-- ) VALUES (
--   'Mingau', 'tigrado', 'Macho', '6 meses', 'Gatinho brincalhão e carinhoso',
--   'resgate-informal', 'Maria Silva', 'São Paulo, SP', '(11) 99999-9999', 'maria@email.com'
-- );
