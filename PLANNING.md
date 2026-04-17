# Backend Planning — LoveCats

> Stack: Node.js · Vercel Serverless Functions · Supabase (PostgreSQL + Storage)  
> Auth: Anônimo (sem login)  
> Frontend ↔ Backend: `fetch` nativo para `/api/*`

---

## Estrutura de Arquivos

```
backend/
├── api/
│   ├── anuncios.js        # POST /api/anuncios — cria novo anúncio
│   ├── cats.js            # GET  /api/cats     — lista gatinhos disponíveis
│   ├── upload-url.js      # POST /api/upload-url — gera URL assinada de upload
│   └── adoption-check.js  # POST /api/adoption-check — verifica adoções (acionado por cron)
├── lib/
│   ├── supabaseAdmin.js   # Cliente Supabase com service_role (acesso total)
│   ├── schemas.js         # Validação Zod dos bodies de entrada
│   └── scraper.js         # Raspador de páginas de ONGs (cheerio)
├── package.json
└── vercel.json            # Configuração de rotas e cron jobs
```

---

## Página "Anuncie Doação" — `/api/anuncios`

### Fluxo completo de envio

```
Usuário preenche form
        │
        ▼
1. Frontend solicita URL assinada para upload da foto
   POST /api/upload-url  →  { signedUrl, path }
        │
        ▼
2. Frontend envia o arquivo DIRETAMENTE para o Supabase Storage
   PUT <signedUrl>  (never passes through Vercel — evita limite de 4.5 MB)
        │
        ▼
3. Frontend envia os dados do formulário + path da foto
   POST /api/anuncios  →  { id do anúncio criado }
        │
        ▼
4. API insere registro na tabela `anuncios_doacao` do Supabase
```

### Endpoint: `POST /api/anuncios`

**Body esperado (JSON):**
```json
{
  "nome_gatinho": "Bolinha",
  "padrao_pelagem": "tigrado",
  "sexo": "Macho",
  "idade": "3 meses",
  "descricao": "...",
  "foto_url": "fotos-gatinhos/uuid/foto.jpg",
  "tipo_doador": "resgate-informal",
  "nome_doador": "Maria Silva",
  "cidade": "São Paulo",
  "whatsapp": "11999999999",
  "email": "maria@email.com",
  "castrado": true,
  "vacinado": false,
  "vermifugado": true,
  "microchipado": false,
  "aceita_outros_animais": true,
  "bom_com_criancas": true,
  "exclusivo_interior": false
}
```

**Campos condicionais por `tipo_doador`:**
| tipo_doador         | Campo adicional        |
|---------------------|------------------------|
| `protetor-registrado` | `doc_protetor_url`   |
| `ong`               | `ong_link_contact`     |

**Resposta de sucesso (`201`):**
```json
{ "id": "uuid-do-anuncio" }
```

### Endpoint: `POST /api/upload-url`

**Body:**
```json
{ "filename": "foto.jpg", "contentType": "image/jpeg" }
```

**Resposta:**
```json
{
  "signedUrl": "https://supabase-storage.../...",
  "path": "fotos-gatinhos/<uuid>/<filename>"
}
```

---

## Página "Adote um Gatinho" — `/api/cats`

### Endpoint: `GET /api/cats`

Retorna os anúncios com `status = 'disponivel'`, paginados e filtráveis.

**Query params suportados:**
| Param       | Tipo   | Descrição                              |
|-------------|--------|----------------------------------------|
| `cidade`    | string | Filtra por cidade (case-insensitive)   |
| `sexo`      | string | `Macho` ou `Fêmea`                     |
| `castrado`  | bool   | `true` ou `false`                      |
| `vacinado`  | bool   | `true` ou `false`                      |
| `page`      | number | Página (default: 1)                    |
| `limit`     | number | Resultados por página (default: 12, max: 48) |

**Resposta de sucesso (`200`):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome_gatinho": "Bolinha",
      "padrao_pelagem": "tigrado",
      "sexo": "Macho",
      "idade": "3 meses",
      "descricao": "...",
      "foto_url": "https://cdn.supabase.io/...",
      "cidade": "São Paulo",
      "castrado": true,
      "vacinado": false,
      "bom_com_criancas": true,
      "aceita_outros_animais": true,
      "criado_em": "2025-04-03T12:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 12
}
```

---

## Automação de Status de Adoção — `/api/adoption-check`

### Objetivo

Verificar periodicamente se cada gatinho anunciado foi adotado e atualizar automaticamente `status = 'adotado'` na tabela, sem exigir ação manual do doador.

### Estratégia por tipo de doador

---

#### 1. `resgate-informal` (pessoa física sem documentação)

**Dados disponíveis:** nome, whatsapp, email  
**Estratégia:** Envio periódico de email com link de confirmação

```
Cron semanal → busca anúncios com status='disponivel' e tipo_doador='resgate-informal'
            → envia email para cada doador com dois botões:
               [✓ Foi adotado!]  [Ainda disponível]
            → cada botão aponta para /api/adoption-check?id=<uuid>&status=<valor>&token=<hmac>
            → API valida o token HMAC e atualiza o status
```

**Token de segurança:** HMAC-SHA256 sobre `id + status + secret`, validade de 72 horas.

---

#### 2. `protetor-registrado` (protetor com documentação formal)

**Dados disponíveis:** nome, email, `doc_protetor_url`  
**Estratégia:** Igual ao resgate-informal + email mais formal

```
Cron semanal → busca anúncios com status='disponivel' e tipo_doador='protetor-registrado'
            → envia email formatado (nome do protetor, nome do gatinho)
            → botões de confirmação com token HMAC
            → atualiza status ao clicar
```

---

#### 3. `ong` (organização não governamental)

**Dados disponíveis:** `ong_link_contact` (URL pública da ONG)  
**Estratégia:** Bot raspador que acessa a página da ONG e detecta se o animal ainda está listado

```
Cron semanal → busca anúncios com status='disponivel' e tipo_doador='ong'
            → para cada anúncio:
                1. Faz GET no ong_link_contact com timeout de 10s
                2. Analisa o HTML da resposta:
                   - Se a página não carregar (4xx/5xx) → marca como 'adotado'
                   - Se encontrar palavras como "adotado", "adotada", "já tem lar" → marca como 'adotado'
                   - Se o nome do gatinho não aparecer mais na página → marca como 'adotado'
                   - Caso contrário → não altera o status
                3. Registra o resultado em tabela de logs
```

**Palavras-chave a verificar (case-insensitive):**  
`adotado`, `adotada`, `adoção realizada`, `já tem lar`, `encontrou lar`, `inativo`, `indisponível`, `removido`

**Bibliotecas:**
- `node-fetch` — requisição HTTP à página da ONG
- `cheerio` — parse e busca no HTML (jQuery-like, sem browser)

**Limitações e cuidados:**
- Algumas ONGs usam SPAs (React/Vue) — o HTML retornado pode não conter o conteúdo renderizado. Nesses casos, `cheerio` não será suficiente. Solução futura: detectar se é SPA e usar `puppeteer` (execução mais lenta e cara).
- Bloquear domínios suspeitos na lista de `ong_link_contact` para evitar SSRF.
- Respeitar `robots.txt` dos sites visitados.
- Adicionar `User-Agent` próprio: `LoveCats-AdoptionBot/1.0`.

---

### Cron Jobs (Vercel)

Configuração em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/adoption-check",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

> Executa toda segunda-feira às 9h UTC.  
> Plano Vercel Pro necessário para cron jobs. No plano Hobby, usar serviço externo (ex: cron-job.org, GitHub Actions schedule).

---

## Dependências (`backend/package.json`)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.4",
    "cheerio": "^1.0.0",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## Variáveis de Ambiente (`.env`)

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SECRET_KEY=<secret-key>          # Usado no back-end (supabaseAdmin.js)
SUPABASE_PUBLISHABLE_KEY=<publishable-key> # Seguro no front-end (leitura pública)
HMAC_SECRET=<string-aleatoria-forte>
```

> **Nota sobre nomenclatura do Supabase (2025+):**  
> O dashboard renomeou as chaves. A nova "**Secret key**" equivale à antiga `service_role key` — acesso irrestrito, **nunca expor no frontend**.  
> A nova "**Publishable key**" equivale à antiga `anon key` — respeita as RLS policies, pode ser usada no browser.

> No Vercel: configurar em Project Settings → Environment Variables.  
> Nunca commitar os valores reais no repositório.

---

## Fases de Implementação

### Fase 1 — Core (Anuncie + Adote)
- [ ] `backend/lib/supabaseAdmin.js`
- [ ] `backend/lib/schemas.js` (validação Zod)
- [ ] `backend/api/upload-url.js`
- [ ] `backend/api/anuncios.js`
- [ ] `backend/api/cats.js`
- [ ] Conectar `anuncie-doacao.html` ao `POST /api/anuncios`
- [ ] Conectar `adote-um-gatinho.html` ao `GET /api/cats`

### Fase 2 — Automação de Adoção
- [ ] `backend/lib/scraper.js` (raspador + validação SSRF)
- [ ] `backend/api/adoption-check.js` (cron handler)
- [ ] Tabela `adoption_check_logs` no Supabase
- [ ] Testar scraper com páginas reais de ONGs
- [ ] Configurar cron no Vercel (ou serviço alternativo)

### Fase 3 — Email de Confirmação + Entregabilidade

> **Contexto**: projeto sem fins lucrativos rodando com tecnologia gratuita. Será usado um email pessoal como remetente (Gmail ou Outlook), sem domínio próprio. SPF/DKIM/DMARC não são configuráveis pelo projeto — já são gerenciados pelo Google/Microsoft, o que na prática garante boa reputação de entrega.

**Provider recomendado: Nodemailer + Gmail SMTP**
- Totalmente gratuito
- Requer uma conta Gmail dedicada ao projeto (ex: `lovecats.doacao@gmail.com`)
- Autenticação via **App Password** (não usa senha principal — exige 2FA ativado na conta)
- Limite: ~500 emails/dia — suficiente para o volume esperado do projeto
- Alternativa zero-config: **Brevo (ex-Sendinblue)** — plano gratuito com 300 emails/dia, aceita conta pessoal como remetente após verificação simples

```env
EMAIL_USER=lovecats.doacao@gmail.com
EMAIL_APP_PASSWORD=<app-password-gerada-no-google>
```

**Tarefas:**
- [ ] Criar conta Gmail dedicada ao projeto e gerar App Password
- [ ] Instalar `nodemailer` no backend
- [ ] Template de email com botões de confirmação (HTML simples, compatível com clientes de email)
- [ ] Endpoint de resposta com validação HMAC
- [ ] Expiração de tokens (72h)
- [ ] **Double opt-in**: ao criar o anúncio, enviar email de verificação antes de ativar (`status = 'pendente_email'`). O anúncio só fica `'disponivel'` após o doador confirmar o email. Isso elimina endereços inválidos E melhora entregabilidade futura (usuário interagiu ativamente com o email).
- [ ] No frontend (`anuncie-doacao.html`): após envio do formulário, exibir banner: *"Verifique sua caixa de entrada — e adicione lovecats.doacao@gmail.com aos seus contatos para garantir o recebimento."* Não é possível forçar o whitelist via browser; a instrução visual é o máximo que o frontend pode fazer.
- [ ] Validação de formato de email no campo do formulário (regex + feedback visual) para evitar erros de digitação antes do envio.


Quando a api for liberada vamos disponibilizar a inclusão de lotes de anuncios.