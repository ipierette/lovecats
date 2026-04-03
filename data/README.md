# 📊 LoveCats - Database Schema

Esta pasta contém todos os arquivos relacionados ao banco de dados PostgreSQL do projeto LoveCats, hospedado no **Supabase**.

## 📁 Arquivos

- **`anuncios_doacao.sql`**: Schema completo da tabela principal de anúncios de doação
- **`supabase-integration.js`**: Exemplos de integração com o Supabase Client
- **`queries-uteis.sql`**: Queries SQL úteis para consultas e manutenção

## 🚀 Como Configurar

### 1. **Criar Projeto no Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Aguarde a criação do banco de dados

### 2. **Executar o Schema SQL**

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo de `anuncios_doacao.sql`
4. Execute o script (botão **Run**)

### 3. **Configurar Storage Buckets**

No Supabase Dashboard > **Storage**:

#### Bucket 1: `fotos-gatinhos` (Público)
- Armazena fotos dos gatos
- Acesso público para leitura
- Tamanho máximo: 5 MB por arquivo
- Formatos: JPG, PNG, WebP, GIF

#### Bucket 2: `documentos-doacao` (Privado)
- Armazena documentos sensíveis (atestados, comprovantes)
- Acesso restrito (apenas autenticados)
- Tamanho máximo: 5 MB por arquivo
- Formatos: JPG, PNG, PDF

**Comandos para criar buckets** (via SQL Editor):

```sql
-- Bucket para fotos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-gatinhos', 
  'fotos-gatinhos', 
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Bucket para documentos (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-doacao', 
  'documentos-doacao', 
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);
```

### 4. **Obter Credenciais do Projeto**

No Supabase Dashboard > **Settings** > **API**:

- **URL do Projeto**: `https://seu-projeto.supabase.co`
- **anon (public) key**: Use para requisições públicas
- **service_role key**: Use apenas no backend (NUNCA exponha no frontend)

### 5. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

⚠️ **IMPORTANTE**: Adicione `.env` ao `.gitignore`!

## 🗄️ Estrutura da Tabela

### Tabela: `anuncios_doacao`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único (gerado automaticamente) |
| `created_at` | TIMESTAMP | Data de criação do anúncio |
| `updated_at` | TIMESTAMP | Última atualização (trigger automático) |
| `status` | ENUM | `'disponivel'` (padrão) ou `'adotado'` |
| `nome_gatinho` | VARCHAR(100) | Nome do gato |
| `padrao_pelagem` | ENUM | Padrão da pelagem (sólido, tigrado, etc.) |
| `sexo` | ENUM | `'Macho'` ou `'Fêmea'` |
| `idade` | VARCHAR(50) | Idade em texto (ex: "3 meses") |
| `descricao` | TEXT | Descrição livre do gatinho |
| `foto_url` | TEXT | URL pública da foto (Supabase Storage) |
| `tipo_doador` | ENUM | `'resgate-informal'`, `'protetor-registrado'` ou `'ong'` |
| `doc_protetor_url` | TEXT | URL privada do documento do protetor |
| `nome_doador` | VARCHAR(200) | Nome completo do doador |
| `cidade` | VARCHAR(200) | Cidade e estado (ex: "São Paulo, SP") |
| `whatsapp` | VARCHAR(20) | Telefone para contato |
| `ong_link_contact` | TEXT | Link do anúncio na página da ONG |
| `email` | VARCHAR(255) | Email do doador |
| `vacinado` | BOOLEAN | Se o gato foi vacinado |
| `doc_vacina_url` | TEXT | URL da caderneta de vacinação |
| `castrado` | BOOLEAN | Se o gato foi castrado |
| `doc_castracao_url` | TEXT | URL do atestado de castração |
| `vermifugado` | BOOLEAN | Se foi vermifugado |
| `microchip` | BOOLEAN | Se possui microchip |
| `testado_fiv_felv` | BOOLEAN | Se foi testado para FIV/FeLV |
| `socializavel` | BOOLEAN | Se socializa com outros pets |
| `idoso` | BOOLEAN | Se é gato maduro/sênior (7+ anos) |
| `condicao_especial` | BOOLEAN | Se possui condição especial |
| `condicao_especial_descricao` | VARCHAR(100) | Descrição da condição especial |
| `user_id` | UUID | ID do usuário (Supabase Auth) - opcional |
| `visualizacoes` | INTEGER | Contador de visualizações |
| `ultima_confirmacao` | TIMESTAMP | Última confirmação de disponibilidade |

## 🔐 Políticas RLS (Row Level Security)

As seguintes políticas estão configuradas:

1. **Leitura pública**: Qualquer pessoa pode ver anúncios com status `'disponivel'`
2. **Leitura própria**: Usuários autenticados veem seus próprios anúncios (todos os status)
3. **Criação pública**: Qualquer pessoa pode criar anúncios
4. **Atualização restrita**: Apenas o proprietário pode atualizar
5. **Deleção restrita**: Apenas o proprietário pode deletar
6. **Admins**: Role `'admin'` tem acesso total

## 📦 Tecnologias

- **PostgreSQL 15+**: Banco de dados relacional
- **Supabase**: Backend-as-a-Service
- **Supabase Storage**: Armazenamento de arquivos
- **Row Level Security**: Segurança em nível de linha
- **Triggers**: Atualização automática de `updated_at`

## 📖 Documentação Adicional

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/installing)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contribuindo

Ao modificar o schema:
1. Documente mudanças neste README
2. Adicione migrations adequadas
3. Atualize as funções auxiliares se necessário
4. Teste localmente antes de aplicar em produção

---

**Criado em**: 21 de março de 2026  
**Versão**: 1.0.0
