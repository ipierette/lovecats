# 🚀 Guia Rápido de Setup - Banco de Dados LoveCats

Este guia oferece instruções passo a passo para configurar o banco de dados PostgreSQL no Supabase para o projeto LoveCats.

## ⏱️ Tempo Estimado: 15-20 minutos

---

## 📋 Pré-requisitos

- [ ] Conta no [Supabase](https://supabase.com) (gratuita)
- [ ] Node.js 16+ instalado
- [ ] Git configurado
- [ ] Editor de código (VS Code recomendado)

---

## 🔧 Passo 1: Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `lovecats-db`
   - **Database Password**: Escolha uma senha forte (guarde-a!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
   - **Pricing Plan**: Free (adequado para desenvolvimento)
4. Clique em **"Create new project"**
5. ⏳ Aguarde ~2 minutos enquanto o Supabase configura o banco

---

## 💾 Passo 2: Executar Schema SQL

1. No Supabase Dashboard, vá para **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **"+ New query"**
3. Abra o arquivo `data/anuncios_doacao.sql` do projeto LoveCats
4. Copie **TODO** o conteúdo do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **"Run"** (ou pressione `Ctrl/Cmd + Enter`)
7. ✅ Verifique se apareceu "Success. No rows returned" (isso é esperado!)

### ⚠️ Se houver erro:

- Verifique se copiou o arquivo completo
- Confirme que o projeto Supabase foi totalmente criado
- Tente executar o script em seções menores (por blocos de comentários)

---

## 🗂️ Passo 3: Configurar Storage Buckets

### 3.1. Criar Bucket de Fotos (Público)

1. No Supabase Dashboard, vá para **Storage** (ícone de pasta no menu lateral)
2. Clique em **"Create a new bucket"**
3. Preencha:
   - **Name**: `fotos-gatinhos`
   - **Public bucket**: ✅ **Marque esta opção**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
4. Clique em **"Create bucket"**

### 3.2. Criar Bucket de Documentos (Privado)

1. Clique em **"Create a new bucket"** novamente
2. Preencha:
   - **Name**: `documentos-doacao`
   - **Public bucket**: ❌ **Deixe desmarcado**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, application/pdf`
3. Clique em **"Create bucket"**

### 3.3. Configurar Políticas de Storage

1. Vá para **SQL Editor** novamente
2. Crie uma **nova query**
3. Copie as políticas da **seção 7** do arquivo `anuncios_doacao.sql` (linhas ~420-460)
4. Cole e execute no SQL Editor
5. ✅ Confirme se não houve erros

---

## 🔑 Passo 4: Obter Credenciais da API

1. No Supabase Dashboard, vá para **Settings** > **API**
2. Role até a seção **Project API keys**
3. Você verá duas chaves:
   - **`anon` `public`**: Chave pública (pode ser usada no frontend)
   - **`service_role`**: Chave secreta (NUNCA exponha no frontend!)
4. Copie também a **Project URL** (ex: `https://abc123.supabase.co`)

---

## 💻 Passo 5: Configurar Variáveis de Ambiente

1. Na raiz do projeto LoveCats, copie o arquivo de exemplo:
   ```bash
   cp data/.env.example .env
   ```

2. Abra o arquivo `.env` e preencha com suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   VITE_STORAGE_BUCKET_FOTOS=fotos-gatinhos
   VITE_STORAGE_BUCKET_DOCS=documentos-doacao
   ```

3. Salve o arquivo

### ⚠️ Segurança:
- **NUNCA** commite o arquivo `.env` ao Git
- O `.gitignore` já está configurado para ignorá-lo
- Use `.env.example` como template para outros desenvolvedores

---

## 📦 Passo 6: Instalar Dependências do Supabase

No terminal, na raiz do projeto:

```bash
npm install @supabase/supabase-js
```

---

## ✅ Passo 7: Testar a Configuração

### 7.1. Teste no SQL Editor

Execute esta query no **SQL Editor** do Supabase:

```sql
-- Inserir um anúncio de teste
INSERT INTO anuncios_doacao (
  nome_gatinho, padrao_pelagem, sexo, idade, descricao,
  tipo_doador, nome_doador, cidade, whatsapp, email
) VALUES (
  'Mingau', 'tigrado', 'Macho', '6 meses', 'Gatinho brincalhão e carinhoso',
  'resgate-informal', 'Maria Silva', 'São Paulo, SP', '(11) 99999-9999', 'maria@teste.com'
) RETURNING *;
```

✅ Se retornar um objeto JSON com os dados, está funcionando!

### 7.2. Verificar se o anúncio aparece:

```sql
SELECT * FROM anuncios_doacao WHERE status = 'disponivel';
```

### 7.3. Limpar dados de teste:

```sql
DELETE FROM anuncios_doacao WHERE email LIKE '%teste.com';
```

---

## 🎨 Passo 8: Integrar com o Frontend

1. Crie um arquivo `src/lib/supabase.js` com:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. Importe onde necessário:
```javascript
import { supabase } from './lib/supabase.js';
```

3. Use os exemplos do arquivo `data/supabase-integration.js` como referência

---

## 📊 Passo 9: Verificar Políticas RLS

1. No Supabase Dashboard, vá para **Authentication** > **Policies**
2. Selecione a tabela `anuncios_doacao`
3. Verifique se as 6 políticas estão ativas:
   - ✅ Leitura pública de anúncios disponíveis
   - ✅ Usuários podem ver seus próprios anúncios
   - ✅ Criação pública de anúncios
   - ✅ Proprietário pode atualizar anúncio
   - ✅ Proprietário pode deletar anúncio
   - ✅ Administradores têm acesso total

---

## 🎉 Pronto! Banco de Dados Configurado

Agora você pode:
- ✅ Criar anúncios de doação via formulário
- ✅ Fazer upload de fotos para o Supabase Storage
- ✅ Armazenar documentos privados (atestados, comprovantes)
- ✅ Buscar e filtrar anúncios
- ✅ Atualizar status para "adotado"
- ✅ Visualizar estatísticas

---

## 📚 Próximos Passos

1. **Integrar o formulário**: Conecte `anuncie-doacao.html` com `supabase-integration.js`
2. **Implementar busca**: Use as funções de busca na página de adoção
3. **Adicionar autenticação**: Configure Supabase Auth para usuários registrados
4. **Criar dashboard admin**: Painel para gerenciar anúncios
5. **Implementar emails**: Sistema de confirmação semanal para protetores/ONGs

---

## 🆘 Problemas Comuns

### "Error: Invalid API key"
- Verifique se copiou corretamente a chave do Supabase Dashboard
- Confirme se o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento

### "Error: relation 'anuncios_doacao' does not exist"
- O schema SQL não foi executado corretamente
- Vá para SQL Editor e execute `anuncios_doacao.sql` novamente

### "Error: new row violates row-level security policy"
- As políticas RLS não foram criadas
- Execute a seção 6 do arquivo `anuncios_doacao.sql`

### "Permission denied for bucket"
- As políticas de Storage não foram configuradas
- Execute os comandos da seção 7 do `anuncios_doacao.sql`

---

## 📖 Recursos Úteis

- 📘 [Documentação Supabase](https://supabase.com/docs)
- 🎥 [Supabase Tutorial em Português](https://www.youtube.com/results?search_query=supabase+tutorial+português)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 📝 [PostgreSQL Cheat Sheet](https://www.postgresqltutorial.com/postgresql-cheat-sheet/)

---

## 🤝 Precisa de Ajuda?

- Verifique o arquivo `data/README.md` para documentação completa
- Consulte `data/queries-uteis.sql` para exemplos de queries
- Revise `data/supabase-integration.js` para exemplos de código

---

**Boa sorte com o desenvolvimento! 🐱💜**
