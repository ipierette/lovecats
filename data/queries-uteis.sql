-- =============================================================================
-- LOVECATS - Queries SQL Úteis
-- =============================================================================
-- Este arquivo contém queries úteis para consultas, manutenção e análise
-- de dados da tabela anuncios_doacao.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CONSULTAS BÁSICAS
-- -----------------------------------------------------------------------------

-- Listar todos os anúncios disponíveis
SELECT 
  id,
  nome_gatinho,
  sexo,
  idade,
  cidade,
  created_at
FROM anuncios_doacao
WHERE status = 'disponivel'
ORDER BY created_at DESC
LIMIT 20;

-- Buscar anúncios por cidade
SELECT 
  id,
  nome_gatinho,
  sexo,
  idade,
  cidade,
  nome_doador,
  whatsapp
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND cidade ILIKE '%São Paulo%'
ORDER BY created_at DESC;

-- Buscar anúncios de gatos castrados e vacinados
SELECT 
  id,
  nome_gatinho,
  sexo,
  idade,
  cidade,
  vacinado,
  castrado,
  foto_url
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND castrado = true
  AND vacinado = true
ORDER BY created_at DESC;

-- Buscar anúncios com condições especiais
SELECT 
  id,
  nome_gatinho,
  sexo,
  idade,
  condicao_especial_descricao,
  cidade,
  created_at
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND condicao_especial = true
ORDER BY created_at DESC;

-- Buscar gatos idosos disponíveis
SELECT 
  id,
  nome_gatinho,
  sexo,
  idade,
  cidade,
  descricao
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND idoso = true
ORDER BY created_at DESC;

-- -----------------------------------------------------------------------------
-- 2. ESTATÍSTICAS E ANÁLISES
-- -----------------------------------------------------------------------------

-- Contagem total por status
SELECT 
  status,
  COUNT(*) as total
FROM anuncios_doacao
GROUP BY status;

-- Contagem por tipo de doador
SELECT 
  tipo_doador,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'disponivel' THEN 1 END) as disponiveis,
  COUNT(CASE WHEN status = 'adotado' THEN 1 END) as adotados
FROM anuncios_doacao
GROUP BY tipo_doador
ORDER BY total DESC;

-- Contagem por sexo
SELECT 
  sexo,
  COUNT(*) as total,
  COUNT(CASE WHEN vacinado THEN 1 END) as vacinados,
  COUNT(CASE WHEN castrado THEN 1 END) as castrados
FROM anuncios_doacao
WHERE status = 'disponivel'
GROUP BY sexo;

-- Contagem por padrão de pelagem
SELECT 
  padrao_pelagem,
  COUNT(*) as total
FROM anuncios_doacao
WHERE status = 'disponivel'
GROUP BY padrao_pelagem
ORDER BY total DESC;

-- Top 10 cidades com mais anúncios
SELECT 
  cidade,
  COUNT(*) as total_anuncios,
  COUNT(CASE WHEN status = 'disponivel' THEN 1 END) as disponiveis
FROM anuncios_doacao
GROUP BY cidade
ORDER BY total_anuncios DESC
LIMIT 10;

-- Anúncios mais visualizados
SELECT 
  id,
  nome_gatinho,
  cidade,
  visualizacoes,
  created_at
FROM anuncios_doacao
WHERE status = 'disponivel'
ORDER BY visualizacoes DESC
LIMIT 10;

-- Taxa de adoção por tipo de doador
SELECT 
  tipo_doador,
  COUNT(*) as total_anuncios,
  COUNT(CASE WHEN status = 'adotado' THEN 1 END) as adotados,
  ROUND(
    COUNT(CASE WHEN status = 'adotado' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 
    2
  ) as taxa_adocao_percentual
FROM anuncios_doacao
GROUP BY tipo_doador
ORDER BY taxa_adocao_percentual DESC;

-- Média de dias até adoção
SELECT 
  AVG(
    EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400
  )::numeric(10,2) as media_dias_ate_adocao
FROM anuncios_doacao
WHERE status = 'adotado';

-- Total de visualizações por mês
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total_anuncios,
  SUM(visualizacoes) as total_visualizacoes,
  ROUND(AVG(visualizacoes), 2) as media_visualizacoes
FROM anuncios_doacao
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- -----------------------------------------------------------------------------
-- 3. ANÚNCIOS QUE PRECISAM DE ATENÇÃO
-- -----------------------------------------------------------------------------

-- Anúncios sem fotos
SELECT 
  id,
  nome_gatinho,
  cidade,
  nome_doador,
  email,
  created_at
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND foto_url IS NULL
ORDER BY created_at DESC;

-- Anúncios antigos (mais de 60 dias)
SELECT 
  id,
  nome_gatinho,
  cidade,
  nome_doador,
  email,
  created_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as dias_publicado
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND created_at < NOW() - INTERVAL '60 days'
ORDER BY created_at ASC;

-- Protetores/ONGs que precisam confirmar disponibilidade
SELECT 
  id,
  nome_gatinho,
  nome_doador,
  email,
  tipo_doador,
  ultima_confirmacao,
  created_at
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND tipo_doador IN ('protetor-registrado', 'ong')
  AND (
    ultima_confirmacao IS NULL 
    OR ultima_confirmacao < NOW() - INTERVAL '7 days'
  )
ORDER BY created_at ASC;

-- Anúncios com poucas visualizações (menos de 10)
SELECT 
  id,
  nome_gatinho,
  cidade,
  visualizacoes,
  created_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as dias_publicado
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND visualizacoes < 10
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY visualizacoes ASC, created_at ASC;

-- -----------------------------------------------------------------------------
-- 4. QUERIES DE MANUTENÇÃO
-- -----------------------------------------------------------------------------

-- Resetar contador de visualizações (se necessário)
-- CUIDADO: Executar apenas se realmente necessário
/*
UPDATE anuncios_doacao
SET visualizacoes = 0
WHERE id = 'UUID_DO_ANUNCIO';
*/

-- Atualizar última confirmação (simular confirmação por email)
/*
UPDATE anuncios_doacao
SET ultima_confirmacao = NOW()
WHERE id = 'UUID_DO_ANUNCIO';
*/

-- Marcar múltiplos anúncios antigos como adotados
-- CUIDADO: Confirmar antes de executar
/*
UPDATE anuncios_doacao
SET status = 'adotado'
WHERE status = 'disponivel'
  AND created_at < NOW() - INTERVAL '180 days'
  AND ultima_confirmacao IS NULL;
*/

-- Deletar anúncios de teste (apenas em desenvolvimento)
/*
DELETE FROM anuncios_doacao
WHERE nome_doador ILIKE '%teste%'
  OR email ILIKE '%test%'
  OR email ILIKE '%exemplo%';
*/

-- -----------------------------------------------------------------------------
-- 5. QUERIES PARA RELATÓRIOS
-- -----------------------------------------------------------------------------

-- Relatório mensal de anúncios
SELECT 
  TO_CHAR(created_at, 'YYYY-MM') as mes,
  COUNT(*) as total_anuncios,
  COUNT(CASE WHEN status = 'disponivel' THEN 1 END) as disponiveis,
  COUNT(CASE WHEN status = 'adotado' THEN 1 END) as adotados,
  COUNT(CASE WHEN tipo_doador = 'ong' THEN 1 END) as por_ongs,
  COUNT(CASE WHEN tipo_doador = 'protetor-registrado' THEN 1 END) as por_protetores,
  COUNT(CASE WHEN tipo_doador = 'resgate-informal' THEN 1 END) as por_resgates
FROM anuncios_doacao
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mes DESC;

-- Relatório de saúde dos gatos disponíveis
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN vacinado THEN 1 END) as vacinados,
  COUNT(CASE WHEN castrado THEN 1 END) as castrados,
  COUNT(CASE WHEN vermifugado THEN 1 END) as vermifugados,
  COUNT(CASE WHEN microchip THEN 1 END) as com_microchip,
  COUNT(CASE WHEN testado_fiv_felv THEN 1 END) as testados_fiv_felv,
  COUNT(CASE WHEN socializavel THEN 1 END) as socializaveis,
  ROUND(COUNT(CASE WHEN vacinado THEN 1 END)::numeric / COUNT(*)::numeric * 100, 1) as percentual_vacinados,
  ROUND(COUNT(CASE WHEN castrado THEN 1 END)::numeric / COUNT(*)::numeric * 100, 1) as percentual_castrados
FROM anuncios_doacao
WHERE status = 'disponivel';

-- Relatório completo para admin
SELECT 
  id,
  nome_gatinho,
  sexo,
  idade,
  cidade,
  tipo_doador,
  nome_doador,
  email,
  whatsapp,
  status,
  visualizacoes,
  vacinado,
  castrado,
  created_at,
  updated_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as dias_publicado
FROM anuncios_doacao
ORDER BY created_at DESC
LIMIT 100;

-- Exportação CSV para backup (usar no SQL Editor do Supabase)
/*
COPY (
  SELECT 
    id,
    created_at,
    status,
    nome_gatinho,
    padrao_pelagem,
    sexo,
    idade,
    cidade,
    tipo_doador,
    nome_doador,
    email,
    vacinado,
    castrado,
    visualizacoes
  FROM anuncios_doacao
  ORDER BY created_at DESC
) TO '/tmp/anuncios_backup.csv' WITH CSV HEADER;
*/

-- -----------------------------------------------------------------------------
-- 6. QUERIES PARA DEBUGGING
-- -----------------------------------------------------------------------------

-- Verificar integridade de URLs de fotos
SELECT 
  id,
  nome_gatinho,
  CASE 
    WHEN foto_url IS NOT NULL THEN 'Com foto' ELSE 'Sem foto' 
  END as status_foto
FROM anuncios_doacao
WHERE status = 'disponivel'
ORDER BY foto_url ASC NULLS FIRST;

-- Verificar documentos obrigatórios (ONGs são isentas de doc veterinário)
SELECT 
  id,
  nome_gatinho,
  tipo_doador,
  doc_protetor_url IS NOT NULL as tem_doc_protetor,
  vacinado,
  doc_vacina_url IS NOT NULL as tem_doc_vacina,
  castrado,
  doc_castracao_url IS NOT NULL as tem_doc_castracao
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND (
    (tipo_doador = 'protetor-registrado' AND doc_protetor_url IS NULL)
    OR (tipo_doador != 'ong' AND vacinado = true AND doc_vacina_url IS NULL)
    OR (tipo_doador != 'ong' AND castrado = true AND doc_castracao_url IS NULL)
  );

-- Verificar emails duplicados (possível fraude)
SELECT 
  email,
  COUNT(*) as total_anuncios,
  STRING_AGG(nome_gatinho, ', ') as gatos
FROM anuncios_doacao
WHERE status = 'disponivel'
GROUP BY email
HAVING COUNT(*) > 3
ORDER BY total_anuncios DESC;

-- Verificar anúncios criados recentemente
SELECT 
  id,
  nome_gatinho,
  cidade,
  created_at,
  EXTRACT(MINUTE FROM (NOW() - created_at)) as minutos_atras
FROM anuncios_doacao
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- -----------------------------------------------------------------------------
-- 7. QUERIES DE PERFORMANCE
-- -----------------------------------------------------------------------------

-- Verificar uso de índices
EXPLAIN ANALYZE
SELECT *
FROM anuncios_doacao
WHERE status = 'disponivel'
  AND cidade ILIKE '%São Paulo%'
ORDER BY created_at DESC
LIMIT 20;

-- Tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('anuncios_doacao')) as tamanho_total,
  pg_size_pretty(pg_relation_size('anuncios_doacao')) as tamanho_tabela,
  pg_size_pretty(pg_indexes_size('anuncios_doacao')) as tamanho_indices;

-- Estatísticas de vacuum
SELECT 
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum,
  n_tup_ins as insercoes,
  n_tup_upd as atualizacoes,
  n_tup_del as delecoes
FROM pg_stat_user_tables
WHERE relname = 'anuncios_doacao';

-- -----------------------------------------------------------------------------
-- 8. MIGRAÇÕES — execute no SQL Editor do Supabase quando necessário
-- -----------------------------------------------------------------------------

-- MIGRAÇÃO: Isentar ONGs de comprovação documental veterinária
-- Motive: ONGs não precisam enviar documentos de vacinação/castração.
-- Execute este bloco UMA vez no Supabase Dashboard > SQL Editor:
/*
ALTER TABLE anuncios_doacao DROP CONSTRAINT doc_vacina_required;
ALTER TABLE anuncios_doacao ADD CONSTRAINT doc_vacina_required CHECK (
    (vacinado = FALSE) OR (tipo_doador = 'ong') OR (doc_vacina_url IS NOT NULL)
);

ALTER TABLE anuncios_doacao DROP CONSTRAINT doc_castracao_required;
ALTER TABLE anuncios_doacao ADD CONSTRAINT doc_castracao_required CHECK (
    (castrado = FALSE) OR (tipo_doador = 'ong') OR (doc_castracao_url IS NOT NULL)
);
*/

-- MIGRAÇÃO: Permitir email NULL (ONGs não precisam informar email)
-- Execute AMBOS os comandos abaixo no Supabase Dashboard > SQL Editor:
/*
-- 1. Remove o NOT NULL da coluna (constraint implícita de coluna)
ALTER TABLE anuncios_doacao ALTER COLUMN email DROP NOT NULL;

-- 2. Recria a CHECK constraint para aceitar NULL explicitamente
ALTER TABLE anuncios_doacao DROP CONSTRAINT IF EXISTS valid_email;
ALTER TABLE anuncios_doacao ADD CONSTRAINT valid_email CHECK (
    email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);
*/

-- =============================================================================
-- FIM DAS QUERIES
-- =============================================================================

-- DICAS DE USO:
-- 1. Execute essas queries no SQL Editor do Supabase Dashboard
-- 2. Ajuste os filtros conforme necessário
-- 3. Use LIMIT para não sobrecarregar consultas grandes
-- 4. Sempre teste queries de UPDATE/DELETE em ambiente de desenvolvimento primeiro
-- 5. Faça backup antes de executar queries de manutenção
