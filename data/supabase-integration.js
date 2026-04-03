// =============================================================================
// LOVECATS - Integração com Supabase
// =============================================================================
// Este arquivo contém exemplos de código JavaScript para integração com
// o banco de dados Supabase e Storage.
//
// Instalação: npm install @supabase/supabase-js
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// 1. CONFIGURAÇÃO DO CLIENT
// -----------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -----------------------------------------------------------------------------
// 2. UPLOAD DE IMAGENS (Foto do Gatinho)
// -----------------------------------------------------------------------------

/**
 * Faz upload de uma imagem para o bucket 'fotos-gatinhos'
 * @param {File} file - Arquivo de imagem
 * @param {string} anuncioId - ID do anúncio (UUID)
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadFotoGatinho(file, anuncioId) {
  try {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${anuncioId}/foto.${fileExt}`;
    const filePath = `public/${fileName}`;

    // Upload para o Storage
    const { data, error } = await supabase.storage
      .from('fotos-gatinhos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Substituir se já existir
      });

    if (error) throw error;

    // Obter URL pública
    const { data: publicData } = supabase.storage
      .from('fotos-gatinhos')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 3. UPLOAD DE DOCUMENTOS (Privados)
// -----------------------------------------------------------------------------

/**
 * Faz upload de documento privado (atestados, comprovantes)
 * @param {File} file - Arquivo do documento
 * @param {string} anuncioId - ID do anúncio
 * @param {string} tipo - Tipo do documento ('vacina', 'castracao', 'protetor')
 * @returns {Promise<string>} URL autenticada do documento
 */
export async function uploadDocumento(file, anuncioId, tipo) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${anuncioId}/doc-${tipo}.${fileExt}`;
    const filePath = `private/${fileName}`;

    // Upload para o Storage (bucket privado)
    const { data, error } = await supabase.storage
      .from('documentos-doacao')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // Para documentos privados, retornamos o path (não URL pública)
    // A URL será gerada sob demanda com signed URL
    return filePath;
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error.message);
    throw error;
  }
}

/**
 * Gera URL temporária (signed URL) para documento privado
 * @param {string} filePath - Caminho do arquivo no Storage
 * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
 * @returns {Promise<string>} URL temporária
 */
export async function getDocumentoSignedUrl(filePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from('documentos-doacao')
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Erro ao gerar signed URL:', error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 4. CRIAR ANÚNCIO DE DOAÇÃO
// -----------------------------------------------------------------------------

/**
 * Cria um novo anúncio de doação completo
 * @param {Object} formData - Dados do formulário
 * @returns {Promise<Object>} Anúncio criado
 */
export async function criarAnuncio(formData) {
  try {
    // 1. Gerar ID único para o anúncio
    const anuncioId = crypto.randomUUID();

    // 2. Upload da foto
    let fotoUrl = null;
    if (formData.foto) {
      fotoUrl = await uploadFotoGatinho(formData.foto, anuncioId);
    }

    // 3. Upload dos documentos (se houver)
    let docUrls = {};

    if (formData.docProtetor) {
      docUrls.doc_protetor_url = await uploadDocumento(
        formData.docProtetor,
        anuncioId,
        'protetor'
      );
    }

    if (formData.docVacina) {
      docUrls.doc_vacina_url = await uploadDocumento(
        formData.docVacina,
        anuncioId,
        'vacina'
      );
    }

    if (formData.docCastracao) {
      docUrls.doc_castracao_url = await uploadDocumento(
        formData.docCastracao,
        anuncioId,
        'castracao'
      );
    }

    // 4. Inserir no banco de dados
    const { data, error } = await supabase
      .from('anuncios_doacao')
      .insert([
        {
          id: anuncioId,
          // Informações do gatinho
          nome_gatinho: formData.nomeGatinho,
          padrao_pelagem: formData.corGatinho,
          sexo: formData.sexoGatinho,
          idade: formData.idadeGatinho,
          descricao: formData.descricao,
          foto_url: fotoUrl,

          // Tipo de doador
          tipo_doador: formData.tipoDoador,
          ...docUrls,

          // Contato
          nome_doador: formData.nomeDoador,
          cidade: formData.cidade,
          whatsapp: formData.whatsapp,
          ong_link_contact: formData.ongLinkContact || null,
          email: formData.email,

          // Saúde
          vacinado: formData.vacinado || false,
          castrado: formData.castrado || false,
          vermifugado: formData.vermifugado || false,
          microchip: formData.microchip || false,
          testado_fiv_felv: formData.fivFelv || false,
          socializavel: formData.socializavel || false,
          idoso: formData.idoso || false,
          condicao_especial: formData.condicaoEspecial || false,
          condicao_especial_descricao:
            formData.condicaoEspecialDesc || null,

          // Status (padrão: disponivel)
          status: 'disponivel',
        },
      ])
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    console.error('Erro ao criar anúncio:', error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 5. BUSCAR ANÚNCIOS
// -----------------------------------------------------------------------------

/**
 * Busca anúncios disponíveis com filtros
 * @param {Object} filtros - Filtros de busca
 * @returns {Promise<Array>} Lista de anúncios
 */
export async function buscarAnuncios(filtros = {}) {
  try {
    let query = supabase
      .from('anuncios_doacao')
      .select('*')
      .eq('status', 'disponivel')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filtros.cidade) {
      query = query.ilike('cidade', `%${filtros.cidade}%`);
    }

    if (filtros.sexo) {
      query = query.eq('sexo', filtros.sexo);
    }

    if (filtros.castrado !== undefined) {
      query = query.eq('castrado', filtros.castrado);
    }

    if (filtros.vacinado !== undefined) {
      query = query.eq('vacinado', filtros.vacinado);
    }

    if (filtros.padraoPelagem) {
      query = query.eq('padrao_pelagem', filtros.padraoPelagem);
    }

    // Paginação
    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    if (filtros.offset) {
      query = query.range(filtros.offset, filtros.offset + (filtros.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error.message);
    throw error;
  }
}

/**
 * Busca um anúncio por ID
 * @param {string} id - UUID do anúncio
 * @returns {Promise<Object>} Anúncio encontrado
 */
export async function buscarAnuncioPorId(id) {
  try {
    const { data, error } = await supabase
      .from('anuncios_doacao')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Incrementar visualizações
    await incrementarVisualizacoes(id);

    return data;
  } catch (error) {
    console.error('Erro ao buscar anúncio:', error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 6. ATUALIZAR ANÚNCIO
// -----------------------------------------------------------------------------

/**
 * Atualiza status do anúncio para "adotado"
 * @param {string} id - UUID do anúncio
 * @returns {Promise<boolean>} Sucesso da operação
 */
export async function marcarComoAdotado(id) {
  try {
    const { data, error } = await supabase.rpc('marcar_como_adotado', {
      anuncio_id: id,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao marcar como adotado:', error.message);
    throw error;
  }
}

/**
 * Atualiza informações do anúncio
 * @param {string} id - UUID do anúncio
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>} Anúncio atualizado
 */
export async function atualizarAnuncio(id, updates) {
  try {
    const { data, error } = await supabase
      .from('anuncios_doacao')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Erro ao atualizar anúncio:', error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 7. INCREMENTAR VISUALIZAÇÕES
// -----------------------------------------------------------------------------

/**
 * Incrementa contador de visualizações
 * @param {string} id - UUID do anúncio
 */
export async function incrementarVisualizacoes(id) {
  try {
    await supabase.rpc('increment_visualizacoes', {
      anuncio_id: id,
    });
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error.message);
  }
}

// -----------------------------------------------------------------------------
// 8. ESTATÍSTICAS
// -----------------------------------------------------------------------------

/**
 * Busca estatísticas gerais dos anúncios
 * @returns {Promise<Object>} Estatísticas
 */
export async function buscarEstatisticas() {
  try {
    const { data, error } = await supabase
      .from('stats_anuncios')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error.message);
    throw error;
  }
}

/**
 * Busca anúncios em destaque (6 mais recentes)
 * @returns {Promise<Array>} Lista de anúncios em destaque
 */
export async function buscarAnunciosDestaque() {
  try {
    const { data, error } = await supabase
      .from('anuncios_destaque')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar anúncios em destaque:', error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// 9. EXEMPLO DE USO NO FORMULÁRIO
// -----------------------------------------------------------------------------

/**
 * Exemplo de handler para o formulário de anúncio
 */
export async function handleFormSubmit(event) {
  event.preventDefault();

  try {
    const form = event.target;
    const formData = new FormData(form);

    // Coletar dados do formulário
    const dadosAnuncio = {
      // Informações do gatinho
      nomeGatinho: formData.get('nome'),
      corGatinho: formData.get('cor'),
      sexoGatinho: formData.get('sexo'),
      idadeGatinho: formData.get('idade'),
      descricao: formData.get('descricao'),
      foto: form.querySelector('.dropzone__input').files[0],

      // Tipo de doador
      tipoDoador: formData.get('tipo-doador'),
      docProtetor: formData.get('doc-protetor')
        ? formData.get('doc-protetor')
        : null,

      // Contato
      nomeDoador: formData.get('nome-doador'),
      cidade: formData.get('cidade'),
      whatsapp: formData.get('whatsapp'),
      ongLinkContact: formData.get('ong-link-contact'),
      email: formData.get('email'),

      // Saúde
      vacinado: formData.get('vacinado') === 'on',
      docVacina: formData.get('doc-vacina'),
      castrado: formData.get('castrado') === 'on',
      docCastracao: formData.get('doc-castracao'),
      vermifugado: formData.get('vermifugado') === 'on',
      microchip: formData.get('micropchip') === 'on',
      fivFelv: formData.get('fiv-felv') === 'on',
      socializavel: formData.get('socializavel') === 'on',
      idoso: formData.get('idoso') === 'on',
      condicaoEspecial: formData.get('condicao-especial') === 'on',
      condicaoEspecialDesc: formData.get('especial-desc'),
    };

    // Criar anúncio
    const anuncio = await criarAnuncio(dadosAnuncio);

    console.log('Anúncio criado com sucesso:', anuncio);

    // Mostrar mensagem de sucesso
    form.querySelector('.form-announce').hidden = true;
    form.querySelector('.form-success').hidden = false;

    return anuncio;
  } catch (error) {
    console.error('Erro ao enviar formulário:', error);
    alert('Erro ao publicar anúncio. Tente novamente.');
  }
}

// -----------------------------------------------------------------------------
// 10. REALTIME SUBSCRIPTIONS (Opcional)
// -----------------------------------------------------------------------------

/**
 * Inscreve-se para receber atualizações em tempo real
 * @param {Function} callback - Função chamada quando houver mudanças
 */
export function subscribeToAnuncios(callback) {
  const channel = supabase
    .channel('anuncios_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'anuncios_doacao',
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// =============================================================================
// EXPORTAÇÕES
// =============================================================================

export default {
  supabase,
  uploadFotoGatinho,
  uploadDocumento,
  getDocumentoSignedUrl,
  criarAnuncio,
  buscarAnuncios,
  buscarAnuncioPorId,
  marcarComoAdotado,
  atualizarAnuncio,
  incrementarVisualizacoes,
  buscarEstatisticas,
  buscarAnunciosDestaque,
  handleFormSubmit,
  subscribeToAnuncios,
};
