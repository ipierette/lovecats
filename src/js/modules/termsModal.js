/**
 * termsModal.js — Injects and controls the "Termos de Uso" modal on every page.
 * If the modal HTML already exists in the page (anuncie-doacao.html), it reuses it.
 * Triggers: .footer-terms-cta, #open-terms, [data-open-terms]
 */

const MODAL_HTML = `
<div class="modal-termos-uso" id="modal-termos-uso" role="dialog" aria-modal="true" aria-labelledby="modal-terms-title" style="display:none;">
  <div class="modal-termos-panel">
    <div class="modal-termos-header">
      <div>
        <span class="modal-termos-badge">Documento Legal</span>
        <h2 id="modal-terms-title" class="modal-termos-title">Termos de Uso – LoveCats</h2>
      </div>
      <button type="button" class="btn-fechar-modal" id="btn-fechar-modal" aria-label="Fechar">×</button>
    </div>
    <div class="modal-termos-body">
      <p class="terms-updated">Última atualização: 03 de abril de 2026</p>
      <p>Bem-vindo(a) à LoveCats. Estes Termos de Uso estabelecem as regras para utilização da plataforma, que conecta pessoas interessadas em adotar gatos a usuários que disponibilizam animais para adoção. Ao acessar ou utilizar a plataforma, você concorda com estes termos. Caso não concorde, recomendamos que não utilize o serviço.</p>

      <hr>
      <h3>1. Sobre a Plataforma</h3>
      <p>A LoveCats é uma plataforma digital aberta que atua exclusivamente como intermediadora de contato entre usuários, não sendo responsável direta pela disponibilização, verificação ou entrega dos animais anunciados.</p>
      <p>A plataforma:</p>
      <ul>
        <li>Não é uma ONG;</li>
        <li>Não realiza visitas domiciliares;</li>
        <li>Não verifica identidade, antecedentes ou documentos dos usuários;</li>
        <li>Não autentica documentos apresentados nos anúncios;</li>
        <li>Não participa das negociações ou do processo de adoção.</li>
      </ul>
      <p>Os anúncios são publicados por usuários independentes, que podem ser protetores, tutores ou organizações. Em alguns casos, o usuário poderá ser redirecionado para plataformas externas.</p>

      <hr>
      <h3>2. Responsabilidade dos Usuários</h3>
      <p>Ao utilizar a plataforma, você declara estar ciente de que:</p>
      <ul>
        <li>Toda interação ocorre por sua conta e risco;</li>
        <li>A veracidade das informações dos anúncios deve ser verificada pelo próprio usuário;</li>
        <li>A LoveCats não se responsabiliza por informações falsas, enganosas ou incompletas;</li>
        <li>O contato entre as partes pode ocorrer por meios externos (como WhatsApp), sem qualquer monitoramento da plataforma.</li>
      </ul>
      <p>O usuário compromete-se a:</p>
      <ul>
        <li>Agir com boa-fé;</li>
        <li>Não publicar informações falsas ou enganosas;</li>
        <li>Não utilizar a plataforma para fins ilícitos ou fraudulentos.</li>
      </ul>

      <hr>
      <h3>3. Segurança na Adoção</h3>
      <p>A LoveCats recomenda fortemente que os usuários adotem práticas de segurança, incluindo, mas não se limitando a:</p>
      <ul>
        <li>Nunca buscar um animal sozinho(a) em local desconhecido;</li>
        <li>Priorizar encontros em locais públicos e durante o dia;</li>
        <li>Solicitar fotos, vídeos e videochamadas antes de encontros presenciais;</li>
        <li>Verificar a coerência das informações fornecidas pelo anunciante;</li>
        <li>Não realizar qualquer tipo de pagamento para adoção;</li>
        <li>Conferir documentos diretamente com clínicas ou profissionais responsáveis;</li>
        <li>Compartilhar sua localização e informações do encontro com pessoas de confiança.</li>
      </ul>
      <p>A decisão de prosseguir com uma adoção é inteiramente do usuário.</p>

      <hr>
      <h3>4. Documentação e Informações dos Animais</h3>
      <p>A plataforma pode solicitar documentos como:</p>
      <ul>
        <li>Comprovantes de vacinação;</li>
        <li>Comprovantes de castração;</li>
        <li>Exames laboratoriais;</li>
        <li>Registro de protetores.</li>
      </ul>
      <p>Entretanto, a LoveCats não garante a autenticidade desses documentos. A verificação deve ser feita diretamente pelo adotante junto às fontes emissoras.</p>

      <hr>
      <h3>5. Encontros e Adoção</h3>
      <p>A LoveCats não participa da entrega do animal nem garante a segurança dos encontros.</p>
      <p>O usuário é integralmente responsável por:</p>
      <ul>
        <li>Avaliar as condições do animal;</li>
        <li>Verificar o ambiente em que ele está inserido;</li>
        <li>Decidir pela continuidade ou não da adoção.</li>
      </ul>
      <p>A plataforma não se responsabiliza por quaisquer danos, prejuízos ou incidentes decorrentes desses encontros.</p>

      <hr>
      <h3>6. Obrigações do Adotante</h3>
      <p>Ao concluir uma adoção, o usuário torna-se o tutor legal do animal, assumindo total responsabilidade por:</p>
      <ul>
        <li>Garantir o bem-estar físico e emocional do animal;</li>
        <li>Manter vacinação e cuidados veterinários atualizados;</li>
        <li>Proporcionar ambiente seguro e adequado;</li>
        <li>Não transferir a posse sem garantir um processo responsável;</li>
        <li>Cumprir a legislação vigente sobre proteção animal.</li>
      </ul>

      <hr>
      <h3>7. Conteúdo e Anúncios</h3>
      <p>A LoveCats se reserva o direito de remover, a qualquer momento e sem aviso prévio, anúncios que:</p>
      <ul>
        <li>Apresentem indícios de fraude;</li>
        <li>Contenham informações falsas;</li>
        <li>Estejam em desacordo com estes termos;</li>
        <li>Possam colocar usuários ou animais em risco.</li>
      </ul>

      <hr>
      <h3>8. Denúncias</h3>
      <p>Usuários podem denunciar anúncios suspeitos ou comportamentos inadequados por meio do canal oficial informado na plataforma.</p>
      <p>As denúncias devem conter, sempre que possível:</p>
      <ul>
        <li>Capturas de tela do anúncio;</li>
        <li>Registros de conversa;</li>
        <li>Informações relevantes que auxiliem na análise.</li>
      </ul>
      <p>A LoveCats analisará as denúncias, mas não garante investigação completa ou resolução do caso.</p>

      <hr>
      <h3>9. Limitação de Responsabilidade</h3>
      <p>A LoveCats não se responsabiliza por:</p>
      <ul>
        <li>A veracidade dos anúncios;</li>
        <li>A conduta dos usuários;</li>
        <li>Qualquer dano direto ou indireto decorrente do uso da plataforma;</li>
        <li>Problemas ocorridos durante negociações, encontros ou adoções.</li>
      </ul>
      <p>O uso da plataforma é de inteira responsabilidade do usuário.</p>

      <hr>
      <h3>10. Modificações dos Termos</h3>
      <p>A LoveCats poderá atualizar estes Termos de Uso a qualquer momento. Recomendamos a revisão periódica deste documento. O uso contínuo da plataforma após alterações implica concordância com os novos termos.</p>

      <hr>
      <h3>11. Disposições Gerais</h3>
      <p>Estes Termos são regidos pelas leis brasileiras. Qualquer controvérsia será resolvida no foro da comarca do usuário ou conforme previsto em lei.</p>

      <p class="terms-closing"><strong>Ao utilizar a LoveCats, você declara estar ciente e de acordo com todos os termos acima, assumindo total responsabilidade por suas ações dentro e fora da plataforma.</strong></p>
    </div>
    <div class="modal-termos-footer">
      <button type="button" class="btn btn-primary" id="btn-aceitar-termos">Li e entendi</button>
    </div>
  </div>
</div>`;

export function initTermsModal() {
  // Inject HTML only if the page doesn't already have the modal (anuncie-doacao.html has it inline)
  if (!document.getElementById('modal-termos-uso')) {
    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
  }

  const modal = document.getElementById('modal-termos-uso');
  if (!modal) return;

  function open(e) {
    if (e) e.preventDefault();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Wire all open triggers: footer pill, inline form link, any [data-open-terms]
  document.querySelectorAll('.footer-terms-cta, #open-terms, [data-open-terms]').forEach(el => {
    el.addEventListener('click', open);
  });

  document.getElementById('btn-fechar-modal')?.addEventListener('click', close);
  document.getElementById('btn-aceitar-termos')?.addEventListener('click', close);

  // Close on overlay click
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') close();
  });
}
