import { GoogleGenAI } from '@google/genai';
import { GenerateDescriptionSchema } from '../lib/schemas.js';

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
 * Gera uma descrição de adoção usando o Gemini.
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

  const d        = parsed.data;
  const nome     = d.nome_gatinho?.trim() || null;
  const pelagem  = PELAGEM_LABEL[d.padrao_pelagem] ?? d.padrao_pelagem;
  const isFemea  = d.sexo === 'Fêmea';

  // Monta lista de saúde/características confirmadas
  const saude = [
    d.vacinado              && `vacinado${isFemea ? 'a' : ''}`,
    d.castrado              && `castrado${isFemea ? 'a' : ''}`,
    d.vermifugado           && `vermifugado${isFemea ? 'a' : ''}`,
    d.fiv_felv              && 'testado(a) para FIV/FeLV (resultado negativo)',
    d.microchipado          && 'com microchip',
    d.aceita_outros_animais && `convive bem com outros pets`,
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
    const ai       = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model:    'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      return res.status(500).json({ error: 'IA retornou resposta vazia' });
    }

    return res.status(200).json({ description: text });
  } catch (err) {
    console.error('[generate-description] Gemini error:', err.message);
    return res.status(500).json({ error: 'Falha ao gerar descrição com IA' });
  }
}
