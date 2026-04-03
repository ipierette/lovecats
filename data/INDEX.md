# 📑 Índice da Pasta Data - LoveCats

Este é o índice completo de todos os arquivos relacionados ao banco de dados do projeto LoveCats.

---

## 📂 Estrutura da Pasta

```
data/
├── INDEX.md                      ← Você está aqui
├── README.md                     ← Documentação principal
├── SETUP-GUIDE.md                ← Guia passo a passo
├── anuncios_doacao.sql           ← Schema completo do banco
├── queries-uteis.sql             ← Queries SQL prontas
├── supabase-integration.js       ← Integração JavaScript
└── .env.example                  ← Template de variáveis de ambiente
```

---

## 📄 Descrição dos Arquivos

### 🔷 Documentação

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[README.md](./README.md)** | Documentação completa do banco de dados. Contém visão geral da estrutura, tabelas, políticas RLS e instruções gerais. | Use como referência principal para entender a arquitetura do banco |
| **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** | Guia passo a passo para configuração inicial. Instruções detalhadas desde criar conta no Supabase até testar a integração. | Use na primeira vez que for configurar o projeto ou ao onboarding de novos desenvolvedores |
| **INDEX.md** | Este arquivo. Índice navegável de toda a pasta. | Use para navegar rapidamente entre os arquivos |

### 🔷 Scripts SQL

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[anuncios_doacao.sql](./anuncios_doacao.sql)** | Schema completo da tabela PostgreSQL. Inclui tipos ENUM, tabelas, índices, triggers, políticas RLS, funções auxiliares e views. | Execute UMA VEZ no SQL Editor do Supabase durante setup inicial. Use como referência para estrutura do banco |
| **[queries-uteis.sql](./queries-uteis.sql)** | Coleção de queries SQL prontas para uso. Consultas, estatísticas, análises, manutenção e debugging. | Use quando precisar fazer consultas avançadas, gerar relatórios ou debugar problemas |

### 🔷 Código JavaScript

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[supabase-integration.js](./supabase-integration.js)** | Biblioteca de funções JavaScript para integração com Supabase. Inclui upload de arquivos, CRUD de anúncios, buscas e funções auxiliares. | Importe no frontend para interagir com o banco de dados e Storage |

### 🔷 Configuração

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| **[.env.example](./.env.example)** | Template de variáveis de ambiente. Contém todas as variáveis necessárias com exemplos. | Copie para `.env` na raiz do projeto e preencha com suas credenciais do Supabase |

---

## 🚀 Fluxo de Trabalho Recomendado

### 1️⃣ Primeira Configuração

```
1. Leia: SETUP-GUIDE.md
2. Execute: anuncios_doacao.sql (no Supabase)
3. Configure: .env (copie de .env.example)
4. Teste: Rode alguns INSERTs de teste
```

### 2️⃣ Desenvolvimento

```
1. Consulte: README.md (para referência de campos/estrutura)
2. Use: supabase-integration.js (importe funções prontas)
3. Debug: queries-uteis.sql (quando precisar de queries específicas)
```

### 3️⃣ Manutenção

```
1. Estatísticas: queries-uteis.sql (seção 2)
2. Problemas: queries-uteis.sql (seção 3)
3. Performance: queries-uteis.sql (seção 7)
```

---

## 📊 Visão Rápida da Estrutura do Banco

### Tabela Principal: `anuncios_doacao`

```
┌─────────────────────────────────────────┐
│         ANUNCIOS_DOACAO                 │
├─────────────────────────────────────────┤
│ 📋 Metadados                            │
│   • id (UUID)                           │
│   • created_at, updated_at              │
│   • status (disponivel/adotado) ⭐      │
├─────────────────────────────────────────┤
│ 🐱 Informações do Gatinho               │
│   • nome_gatinho                        │
│   • padrao_pelagem, sexo, idade         │
│   • descricao                           │
│   • foto_url                            │
├─────────────────────────────────────────┤
│ 👤 Tipo de Doador                       │
│   • tipo_doador                         │
│   • doc_protetor_url                    │
├─────────────────────────────────────────┤
│ 📞 Contato                              │
│   • nome_doador, cidade                 │
│   • whatsapp, email                     │
│   • ong_link_contact                    │
├─────────────────────────────────────────┤
│ 🏥 Saúde                                │
│   • vacinado, doc_vacina_url            │
│   • castrado, doc_castracao_url         │
│   • vermifugado, microchip              │
│   • testado_fiv_felv, socializavel      │
│   • idoso, condicao_especial            │
├─────────────────────────────────────────┤
│ 📊 Tracking                             │
│   • visualizacoes                       │
│   • ultima_confirmacao                  │
│   • user_id (opcional)                  │
└─────────────────────────────────────────┘
```

### Storage Buckets

```
┌──────────────────────────┐  ┌──────────────────────────┐
│   fotos-gatinhos         │  │  documentos-doacao       │
│   (PÚBLICO)              │  │  (PRIVADO)               │
├──────────────────────────┤  ├──────────────────────────┤
│ • JPG, PNG, WebP, GIF    │  │ • JPG, PNG, PDF          │
│ • Max 5 MB               │  │ • Max 5 MB               │
│ • Leitura pública        │  │ • Leitura autenticada    │
│ • Upload público         │  │ • Upload autenticado     │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 🔐 Políticas RLS Ativas

```
✅ Leitura pública (anúncios disponíveis)
✅ Leitura própria (usuário vê seus anúncios)
✅ Criação pública
✅ Atualização restrita (apenas proprietário)
✅ Deleção restrita (apenas proprietário)
✅ Acesso admin total (role = 'admin')
```

---

## 📖 Links Úteis

- 🌐 [Supabase Dashboard](https://app.supabase.com)
- 📚 [Documentação Supabase](https://supabase.com/docs)
- 🔍 [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
- 📦 [Supabase Storage](https://app.supabase.com/project/_/storage)
- 🔐 [Supabase Auth Policies](https://app.supabase.com/project/_/auth/policies)

---

## 🆘 Precisa de Ajuda?

**Problema** | **Onde procurar**
-------------|------------------
Como configurar pela primeira vez | [SETUP-GUIDE.md](./SETUP-GUIDE.md)
Estrutura das tabelas | [README.md](./README.md)
Como fazer upload de fotos | [supabase-integration.js](./supabase-integration.js) (linha 18)
Como criar anúncio | [supabase-integration.js](./supabase-integration.js) (linha 100)
Buscar anúncios | [supabase-integration.js](./supabase-integration.js) (linha 197)
Queries SQL específicas | [queries-uteis.sql](./queries-uteis.sql)
Estatísticas do banco | [queries-uteis.sql](./queries-uteis.sql) (seção 2)
Variáveis de ambiente | [.env.example](./.env.example)

---

## 🎯 Checklist Rápido

Antes de começar o desenvolvimento, confirme:

- [ ] Projeto criado no Supabase
- [ ] Schema SQL executado (`anuncios_doacao.sql`)
- [ ] Buckets de Storage criados (`fotos-gatinhos`, `documentos-doacao`)
- [ ] Políticas de Storage configuradas
- [ ] Arquivo `.env` criado e preenchido
- [ ] Dependência `@supabase/supabase-js` instalada
- [ ] Cliente Supabase configurado no código
- [ ] Teste de inserção realizado com sucesso

---

## 📝 Notas de Versão

**Versão 1.0.0** - 21 de março de 2026
- ✨ Schema inicial da tabela `anuncios_doacao`
- ✨ Políticas RLS configuradas
- ✨ Storage buckets definidos
- ✨ Funções auxiliares criadas
- ✨ Views de estatísticas implementadas
- ✨ Integração JavaScript completa
- ✨ Documentação completa

---

**🐱 Happy Coding! 💜**
