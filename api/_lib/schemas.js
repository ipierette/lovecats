import { z } from 'zod';

// ---------------------------------------------------------------------------
// Upload de arquivo (foto OU documento)
// ---------------------------------------------------------------------------

export const UploadUrlSchema = z.object({
  filename:    z.string().min(1).max(255),
  contentType: z.enum([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf',
  ]),
  bucketType: z.enum(['foto', 'doc']).default('foto'),
});

// ---------------------------------------------------------------------------
// Geração de descrição com IA — campos mínimos obrigatórios
// ---------------------------------------------------------------------------

export const GenerateDescriptionSchema = z.object({
  padrao_pelagem:        z.string().min(2).max(40),
  sexo:                  z.enum(['Macho', 'Fêmea']),
  idade:                 z.string().min(1).max(30),
  // enriquecimento opcional
  nome_gatinho:          z.string().max(60).optional(),
  vacinado:              z.boolean().optional(),
  castrado:              z.boolean().optional(),
  vermifugado:           z.boolean().optional(),
  fiv_felv:              z.boolean().optional(),
  microchipado:          z.boolean().optional(),
  aceita_outros_animais: z.boolean().optional(),
  idoso:                 z.boolean().optional(),
  condicao_especial:     z.boolean().optional(),
  especial_desc:         z.string().max(100).optional(),
});

// ---------------------------------------------------------------------------
// Anúncio de doação — campos compartilhados por todos os tipos de doador
// ---------------------------------------------------------------------------

const AnuncioBaseSchema = z.object({
  nome_gatinho:          z.string().max(60).default('Sem nome'),
  padrao_pelagem:        z.enum(['solido', 'tigrado', 'bicolor', 'tricolor', 'tartaruga', 'colorpoint']),
  sexo:                  z.enum(['Macho', 'Fêmea']),
  idade:                 z.string().min(1).max(30),
  descricao:             z.string().max(1000).optional().default(''),
  foto_url:              z.string().nullable().optional(),

  nome_doador:           z.string().min(2).max(100),
  cidade:                z.string().min(2).max(80),

  castrado:              z.boolean().default(false),
  vacinado:              z.boolean().default(false),
  vermifugado:           z.boolean().default(false),
  microchipado:          z.boolean().default(false),
  fiv_felv:              z.boolean().default(false),
  aceita_outros_animais: z.boolean().default(false),
  idoso:                 z.boolean().default(false),
  condicao_especial:     z.boolean().default(false),
  especial_desc:         z.string().max(100).optional(),

  doc_vacina_url:        z.string().nullable().optional(),
  doc_castracao_url:     z.string().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Variantes por tipo de doador (discriminated union)
// ---------------------------------------------------------------------------

export const AnuncioResgateSchema = AnuncioBaseSchema.extend({
  tipo_doador: z.literal('resgate-informal'),
  whatsapp:    z.string().regex(/^\d{10,11}$/, 'WhatsApp deve ter 10 ou 11 dígitos'),
  email:       z.string().email('E-mail inválido'),
});

export const AnuncioProtetorSchema = AnuncioBaseSchema.extend({
  tipo_doador:      z.literal('protetor-registrado'),
  whatsapp:         z.string().regex(/^\d{10,11}$/, 'WhatsApp deve ter 10 ou 11 dígitos'),
  email:            z.string().email('E-mail inválido'),
  doc_protetor_url: z.string().nullable().optional(),
});

export const AnuncioOngSchema = AnuncioBaseSchema.extend({
  tipo_doador:      z.literal('ong'),
  ong_link_contact: z.string().url('URL da ONG inválida'),
  email:            z.union([z.string().email(), z.literal('')]).optional(),
});

export const AnuncioSchema = z.discriminatedUnion('tipo_doador', [
  AnuncioResgateSchema,
  AnuncioProtetorSchema,
  AnuncioOngSchema,
]);
