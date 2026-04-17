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
${d.idoso ? '- Gato maduro/sênior (7 anos ou mais)' : ''}
${d.condicao_especial && d.especial_desc ? `- Condição especial: ${d.especial_desc}` : ''}`;

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
            content: `Você escreve textos de adoção de gatos para o site LoveCats. Seu estilo é aconchegante e direto — como se um amigo estivesse apresentando o gatinho. Siga estas regras sem exceção:
- Escreva em 2 parágrafos curtos, no máximo 120 palavras no total
- Use pronomes ${isFemea ? 'femininos (ela/dela)' : 'masculinos (ele/dele)'} consistentemente
- Mencione a pelagem de forma natural, sem metáforas exageradas
- Inclua apenas informações dos dados fornecidos; não invente personalidade, comportamento ou características
- Sem frases de efeito, sem superlativo em excesso, sem linguagem comercial ("companheiro perfeito", "espetáculo", "coração cheio de amor")
- Termine com um convite simples e gentil à adoção responsável
- Responda APENAS com o texto, sem título nem marcadores`,
          },
          { role: 'user', content: userPrompt },
        ],
        max_tokens:  300,
        temperature: 0.5,
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
