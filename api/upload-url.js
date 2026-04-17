import { randomUUID } from 'crypto';
import { supabaseAdmin }   from './_lib/supabaseAdmin.js';
import { UploadUrlSchema } from './_lib/schemas.js';

const FOTO_BUCKET = process.env.STORAGE_BUCKET_FOTOS ?? 'fotos-gatinhos';
const DOC_BUCKET  = process.env.STORAGE_BUCKET_DOCS  ?? 'documentos-doacao';

/**
 * POST /api/upload-url
 * Gera uma URL assinada para upload direto ao Supabase Storage.
 * Body: { filename, contentType, bucketType: 'foto' | 'doc' }
 * Resposta: { signedUrl, path, bucket }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const parsed = UploadUrlSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { filename, bucketType } = parsed.data;
  const bucket = bucketType === 'doc' ? DOC_BUCKET : FOTO_BUCKET;
  const path   = `${randomUUID()}/${filename}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    console.error('[upload-url] Supabase error:', error);
    return res.status(500).json({ error: 'Falha ao gerar URL de upload' });
  }

  return res.status(200).json({ signedUrl: data.signedUrl, path, bucket });
}

