import { GenerateDescriptionSchema } from './_lib/schemas.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

const PELAGEM_LABEL = {
  solido:     'sólido (cor uniforme)',
  tigrado:    'tigrado / tabby (listras)',
  bicolor:    'bicolor (dois tons)',
  tricolor:   'tricolor / calico',
  tartaruga:  'tartaruga / tortie',
  colorpoint: 'colorpoint (pontas escuras)',
};

/**
 * POST /api/generate-description
 * Gera uma descrição de adoção usando Llama 3 via Groq (gratuito).
 * Mínimo obrigatório: padrao_pelagem, sexo, idade.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Serviço de IA não configurado' });
  }

  const parsed = GenerateDescriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const d       = parsed.data;
  const nome    = d.nome_gatinho?.trim() || null;
  const pelagem = PELAGEM_LABEL[d.padrao_pelagem] ?? d.padrao_pelagem;
  const isFemea = d.sexo === 'Fêmea';

  const saude = [
    d.vacinado              && `vacinado${isFemea ? 'a' : ''}`,
    d.castrado              && `castrado${isFemea ? 'a' : ''}`,
    d.vermifugado           && `vermifugado${isFemea ? 'a' : ''}`,
    d.fiv_felv              && 'testado(a) para FIV/FeLV (resultado negativo)',
    d.microchipado          && 'com microchip',
    d.aceita_outros_animais && 'convive bem com outros pets',
  ].filter(Boolean).join(', ');

  const userPrompt = `Dados do gatinho:
- ${nome ? `Nome: ${nome}` : 'Sem nome definido ainda'}
- Pelagem: ${pelagem}
- Sexo: ${d.sexo}
- Idade: ${d.idade}
${saude ? `- Saúde / cuidados confirmados: ${saude}` : ''}
${d.idoso ? '- É um gato maduro/sênior (7 anos ou mais) que sonha com um lar tranquilo' : ''}
${d.condicao_especial && d.especial_desc ? `- Condição especial: ${d.especial_desc}` : ''}

Instruções:
- Mencione a pelagem de forma descritiva e poética
- Use pronomes corretos conforme o sexo (${isFemea ? 'ela/dela' : 'ele/dele'})
- Não invente características além das fornecidas
- Termine com um convite gentil à adoção responsável`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role:    'system',
            content: 'Você é um redator carinhoso especializado em anúncios de adoção de gatos no Brasil. Escreva descrições atraentes com tom acolhedor, otimista e próximo do leitor. Responda APENAS com o texto da descrição — sem título, sem marcadores, sem markdown. Máximo de 280 palavras.',
          },
          { role: 'user', content: userPrompt },
        ],
        max_tokens:  512,
        temperature: 0.8,
      }),
    });

    if (!groqRes.ok) {
      const errorBody = await groqRes.json().catch(() => ({}));
      const code    = errorBody?.error?.code ?? groqRes.status;
      const message = errorBody?.error?.message ?? '';
      console.error('[generate-description] Groq API error:', groqRes.status, message);
      if (groqRes.status === 429) {
        return res.status(429).json({ error: 'Limite de uso da IA atingido. Aguarde alguns minutos e tente novamente, ou escreva a descrição manualmente.' });
      }
      return res.status(500).json({ error: 'Falha ao gerar descrição com IA' });
    }

    const data = await groqRes.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ error: 'IA retornou resposta vazia' });
    return res.status(200).json({ description: text });

  } catch (err) {
    console.error('[generate-description] fetch error:', err.message);
    return res.status(500).json({ error: 'Falha ao contactar o serviço de IA' });
  }
}


const PELAGEM_LABEL = {
  solido:     'sólido (cor uniforme)',
  tigrado:    'tigrado / tabby (listras)',
  bicolor:    'bicolor (dois tons)',
  tricolor:   'tricolor / calico',
  tartaruga:  'tartaruga / tortie',
  colorpoint: 'colorpoint (pontas escuras)',
};

/**
 * POST /api/generate-description
 * Gera uma descrição de adoção usando o Gemini via REST (sem SDK).
 * Mínimo obrigatório: padrao_pelagem, sexo, idade.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Serviço de IA não configurado' });
  }

  const parsed = GenerateDescriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const d       = parsed.data;
  const nome    = d.nome_gatinho?.trim() || null;
  const pelagem = PELAGEM_LABEL[d.padrao_pelagem] ?? d.padrao_pelagem;
  const isFemea = d.sexo === 'Fêmea';

  const saude = [
    d.vacinado              && `vacinado${isFemea ? 'a' : ''}`,
    d.castrado              && `castrado${isFemea ? 'a' : ''}`,
    d.vermifugado           && `vermifugado${isFemea ? 'a' : ''}`,
    d.fiv_felv              && 'testado(a) para FIV/FeLV (resultado negativo)',
    d.microchipado          && 'com microchip',
    d.aceita_outros_animais && 'convive bem com outros pets',
  ].filter(Boolean).join(', ');

  const prompt = `Você é um redator carinhoso especializado em anúncios de adoção de gatos no Brasil.
Escreva uma descrição atraente para um anúncio de adoção.
Use tom acolhedor, otimista e próximo do leitor.
Responda APENAS com o texto da descrição — sem título, sem marcadores, sem markdown.
Máximo de 280 palavras.

Dados do gatinho:
- ${nome ? `Nome: ${nome}` : 'Sem nome definido ainda'}
- Pelagem: ${pelagem}
- Sexo: ${d.sexo}
- Idade: ${d.idade}
${saude ? `- Saúde / cuidados confirmados: ${saude}` : ''}
${d.idoso ? '- É um gato maduro/sênior (7 anos ou mais) que sonha com um lar tranquilo' : ''}
${d.condicao_especial && d.especial_desc ? `- Condição especial: ${d.especial_desc}. Apresente de forma positiva, destacando a beleza de adotar um pet especial.` : ''}

Instruções:
- Mencione a pelagem de forma descritiva e poética
- Use pronomes corretos conforme o sexo (${isFemea ? 'ela/dela' : 'ele/dele'})
- Não invente características além das fornecidas
- Termine com um convite gentil à adoção responsável`;

  try {
    const geminiRes = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.8 },
      }),
    });

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.json().catch(() => ({}));
      const code    = errorBody?.error?.code ?? geminiRes.status;
      const message = errorBody?.error?.message ?? '';
      console.error('[generate-description] Gemini API error:', code, message);
      if (code === 429 || message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({ error: 'Limite de uso da IA atingido. Aguarde alguns minutos e tente novamente, ou escreva a descrição manualmente.' });
      }
      return res.status(500).json({ error: 'Falha ao gerar descrição com IA' });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return res.status(500).json({ error: 'IA retornou resposta vazia' });
    return res.status(200).json({ description: text });

  } catch (err) {
    console.error('[generate-description] fetch error:', err.message);
    return res.status(500).json({ error: 'Falha ao contactar o serviço de IA' });
  }
}


