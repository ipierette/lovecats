# PRD - LoveCats
## Product Requirements Document

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo
LoveCats é uma plataforma web de adoção responsável de gatinhos que conecta pessoas que desejam adotar com aquelas que precisam doar gatinhos. A plataforma facilita o processo de adoção através de ferramentas de busca avançada, formulários intuitivos e assistência de IA para criação de anúncios atrativos.

### 1.2 Objetivos do Produto
- Facilitar a adoção responsável de gatinhos
- Reduzir o abandono de animais através de doações diretas
- Proporcionar experiência mobile-first para usuários em qualquer dispositivo
- Democratizar o acesso à adoção através de uma plataforma gratuita
- Utilizar IA para melhorar a qualidade dos anúncios de doação

### 1.3 Público-Alvo
- **Adotantes**: Pessoas que desejam adotar um gatinho
- **Doadores**: Pessoas que precisam doar gatinhos de forma responsável
- **Idade**: 18+ anos
- **Perfil**: Usuários com acesso a smartphones e/ou computadores
- **Geografia**: Inicialmente Brasil (idioma português)

---

## 2. Funcionalidades

### 2.1 Navegação e Estrutura

#### 2.1.1 Header
- **Logo**: Composta por ícone + texto
- **Menu de Navegação**: 
  - Adote um Gatinho
  - Anuncie Doação
  - Sobre
- **Controles**:
  - Toggle de tema (claro/escuro)
  - Menu hambúrguer para mobile

#### 2.1.2 Footer
- Design temático imitando pelo de gato
  - Modo claro: Gradiente laranja
  - Modo escuro: Gradiente preto
- Links de navegação
- Informações de contato/copyright

### 2.2 Páginas Principais

#### 2.2.1 Página: Adote um Gatinho (`/adopt`)

**Layout Desktop:**
- Sidebar esquerda: Filtros de busca
- Área principal direita: Grade de resultados

**Funcionalidades:**
- **Sistema de Busca**:
  - Campo de texto livre (busca por nome, descrição, localização)
  - Filtro por sexo (Todos, Macho, Fêmea)
  - Filtro por idade (Todas, Filhote, Adulto, Idoso)
  - Busca em tempo real

- **Exibição de Resultados**:
  - Cards de gatinhos em grade responsiva
  - Informações visíveis: foto, nome, idade, sexo, localização
  - Badges para: vacinado, castrado
  - Ordenação por data de cadastro (mais recentes primeiro)

- **Card de Gatinho**:
  - Imagem do gatinho
  - Nome
  - Idade
  - Cor
  - Sexo
  - Localização
  - Descrição resumida
  - Indicadores visuais: vacinado, castrado
  - Botão de contato (WhatsApp/telefone)

#### 2.2.2 Página: Anuncie Doação (`/donate`)

**Formulário de Doação:**

Campos obrigatórios (*):
- Nome do gatinho *
- Idade *
- Sexo * (dropdown)
- Cor *
- Descrição *
- Contato *
- Localização *

Campos opcionais:
- URL da foto
- Vacinado (checkbox)
- Castrado (checkbox)

**Assistente de IA:**
- Botão: "Precisa de ajuda para gerar anúncio?"
- Modal com interface de chat
- Usuário descreve o gatinho
- IA gera descrição atrativa e otimizada
- Descrição pode ser inserida automaticamente no formulário

**Validações:**
- Campos obrigatórios devem ser preenchidos
- URL de imagem deve ser válida (quando fornecida)
- Formato de contato deve ser válido

#### 2.2.3 Página: Sobre (`/about`)

**Conteúdo:**
- Visão e missão do LoveCats
- Como funciona a plataforma
- Princípios de adoção responsável
- Informações sobre a equipe/projeto

---

## 3. Especificações Técnicas

### 3.1 Stack Tecnológico
- **Frontend**: React 18.3+ com TypeScript
- **Build Tool**: Vite
- **Estilo**: Tailwind CSS com design system customizado
- **UI Components**: shadcn/ui + Radix UI
- **Roteamento**: React Router DOM
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL
- **Edge Functions**: Supabase Functions
- **IA**: Lovable AI Gateway (Google Gemini)

### 3.2 Design System

#### 3.2.1 Cores (HSL)

**Modo Claro:**
- Background: Bege claro
- Foreground: Marrom escuro
- Primary: Laranja (#F97316)
- Secondary: Bege médio
- Accent: Laranja suave

**Modo Escuro:**
- Background: Preto/cinza escuro
- Foreground: Branco/cinza claro
- Primary: Laranja (#F97316)
- Secondary: Cinza médio
- Accent: Laranja suave

#### 3.2.2 Tipografia
- Font family: System fonts (sans-serif)
- Hierarquia clara (H1-H6)
- Legibilidade otimizada para mobile

#### 3.2.3 Responsividade
- **Mobile First**: Design otimizado para smartphones
- **Breakpoints**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### 3.3 Banco de Dados

#### 3.3.1 Tabela: `kittens`

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| id | UUID | Identificador único | Sim |
| name | TEXT | Nome do gatinho | Sim |
| age | TEXT | Idade do gatinho | Sim |
| gender | TEXT | Sexo (Macho/Fêmea) | Sim |
| color | TEXT | Cor do gatinho | Sim |
| description | TEXT | Descrição detalhada | Sim |
| image_url | TEXT | URL da foto | Não |
| contact | TEXT | Informações de contato | Sim |
| location | TEXT | Cidade/Estado | Sim |
| vaccinated | BOOLEAN | Status de vacinação | Sim (default: false) |
| neutered | BOOLEAN | Status de castração | Sim (default: false) |
| created_at | TIMESTAMP | Data de criação | Sim |
| updated_at | TIMESTAMP | Data de atualização | Sim |

#### 3.3.2 Segurança (RLS Policies)
- **Leitura**: Público (qualquer pessoa pode ver anúncios)
- **Inserção**: Público (qualquer pessoa pode criar anúncios)
- **Atualização**: Restrito (apenas proprietário - futura implementação)
- **Exclusão**: Restrito (apenas proprietário - futura implementação)

### 3.4 Edge Functions

#### 3.4.1 Function: `generate-ad`
- **Endpoint**: `/functions/v1/generate-ad`
- **Método**: POST
- **Input**: `{ prompt: string }`
- **Output**: `{ ad: string }`
- **IA Model**: google/gemini-2.5-flash-lite
- **Propósito**: Gerar descrições atrativas para anúncios de doação

**Prompt System:**
```
Você é um assistente especializado em criar anúncios de adoção de gatinhos.
Crie descrições atrativas, emocionantes e informativas que ajudem os gatinhos
a encontrar um lar amoroso. Seja conciso mas cativante.
```

---

## 4. Fluxos de Usuário

### 4.1 Fluxo de Adoção

1. Usuário acessa página "Adote um Gatinho"
2. Visualiza lista de gatinhos disponíveis
3. Aplica filtros (opcional):
   - Busca por palavra-chave
   - Filtro por sexo
   - Filtro por idade
4. Visualiza resultados filtrados
5. Clica em card de gatinho de interesse
6. Visualiza informações completas
7. Clica em botão de contato
8. Entra em contato direto com doador

### 4.2 Fluxo de Doação

1. Usuário acessa página "Anuncie Doação"
2. Visualiza formulário de cadastro
3. Opção A - Com IA:
   - Clica em "Precisa de ajuda para gerar anúncio?"
   - Descreve o gatinho no chat
   - IA gera descrição
   - Descrição é inserida no campo
   - Preenche demais campos
4. Opção B - Manual:
   - Preenche todos os campos manualmente
5. Submete formulário
6. Recebe confirmação de sucesso
7. Anúncio publicado e visível na página de adoção

### 4.3 Fluxo de IA

1. Usuário clica em "Precisa de ajuda para gerar anúncio?"
2. Modal abre com interface de chat
3. Usuário digita descrição do gatinho
4. Sistema envia prompt para Edge Function
5. Edge Function processa com IA
6. IA retorna descrição otimizada
7. Descrição é exibida no modal
8. Usuário pode:
   - Usar a descrição gerada (insere no formulário)
   - Editar a descrição
   - Gerar nova descrição

---

## 5. Requisitos Não-Funcionais

### 5.1 Performance
- Carregamento inicial < 3 segundos
- Busca e filtros responsivos (< 500ms)
- Imagens otimizadas e lazy loading
- Edge functions com timeout de 10 segundos

### 5.2 Acessibilidade
- Contraste adequado (WCAG AA)
- Labels em todos os formulários
- Navegação por teclado
- Textos alternativos em imagens
- Semântica HTML adequada

### 5.3 SEO
- Meta tags otimizadas
- Títulos descritivos em todas as páginas
- Estrutura semântica (header, main, footer, section)
- URLs amigáveis
- Open Graph tags

### 5.4 Segurança
- RLS policies no banco de dados
- Validação de inputs no frontend e backend
- Proteção contra SQL injection (via Supabase)
- HTTPS obrigatório
- Sanitização de URLs de imagens

### 5.5 Usabilidade
- Interface intuitiva
- Feedback visual para ações
- Mensagens de erro claras
- Toasts para confirmações
- Estados de loading visíveis

---

## 6. Métricas de Sucesso

### 6.1 KPIs Primários
- Número de anúncios criados/mês
- Número de visualizações de gatinhos
- Taxa de uso da IA para gerar anúncios
- Taxa de conversão (contatos realizados)

### 6.2 KPIs Secundários
- Tempo médio na plataforma
- Taxa de rejeição
- Dispositivos mais utilizados
- Filtros mais utilizados

---

## 7. Roadmap Futuro

### 7.1 Fase 2 (Curto Prazo)
- [ ] Sistema de autenticação de usuários
- [ ] Gestão de anúncios próprios (editar/excluir)
- [ ] Upload de imagens direto na plataforma
- [ ] Sistema de favoritos
- [ ] Notificações de novos gatinhos

### 7.2 Fase 3 (Médio Prazo)
- [ ] Chat direto na plataforma
- [ ] Sistema de avaliações/reputação
- [ ] Filtros avançados (raça, tamanho, personalidade)
- [ ] Geolocalização e mapa
- [ ] Compartilhamento social

### 7.3 Fase 4 (Longo Prazo)
- [ ] App mobile nativo
- [ ] Sistema de matching (IA sugere gatinhos)
- [ ] Blog com conteúdo educativo
- [ ] Parcerias com veterinários
- [ ] Sistema de doações financeiras

---

## 8. Considerações de Implementação

### 8.1 Prioridades
1. **Crítico**: Funcionalidades core (busca, cadastro, listagem)
2. **Alto**: IA para anúncios, responsividade
3. **Médio**: Animações, tema escuro
4. **Baixo**: Features futuras

### 8.2 Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Spam de anúncios | Alto | Média | Implementar CAPTCHA e moderação |
| Imagens inadequadas | Alto | Média | Validação e moderação de conteúdo |
| Sobrecarga de IA | Médio | Baixa | Rate limiting e cache |
| Baixa adoção | Alto | Média | Marketing e parcerias com ONGs |

### 8.3 Dependências
- Lovable Cloud (backend)
- Lovable AI Gateway (IA)
- Supabase (infraestrutura)
- Domínio e hospedagem

---

## 9. Glossário

- **RLS**: Row Level Security (segurança em nível de linha)
- **Edge Function**: Função serverless executada na borda da rede
- **Mobile First**: Abordagem de design que prioriza dispositivos móveis
- **HSL**: Hue, Saturation, Lightness (modelo de cor)
- **PRD**: Product Requirements Document

---

## 10. Aprovações

| Stakeholder | Role | Data | Assinatura |
|-------------|------|------|------------|
| - | Product Owner | - | - |
| - | Tech Lead | - | - |
| - | Design Lead | - | - |

---

**Versão**: 1.0  
**Data**: Outubro 2025  
**Autor**: LoveCats Team  
**Status**: Draft