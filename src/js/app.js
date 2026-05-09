/**
 * app.js — LoveCats main entry point (ES module)
 * Imported via <script type="module"> on every page.
 */

import { initTheme }       from './modules/theme.js';
import { initNav }         from './modules/nav.js';
import { initAnimations, initCounters } from './modules/animations.js';
import { initFilters }     from './modules/filters.js';
import { initImageUpload, getUploadedFiles } from './modules/imageUpload.js';
import { initTeamAccordion } from './modules/teamAccordion.js';
import { initTermsModal }  from './modules/termsModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // ── Global (every page) ──────────────────────────────────────────────
  initTheme();
  initNav();
  initAnimations();
  initTermsModal();

  // ── Page-specific ──────────────────────────────────────────
  const body = document.body;

  if (body.dataset.page === 'home') {
    initResponsibleGallery();
    // Counters stay at 0 until the fetch resolves — no mock ghost.
    fetch('/api/metrics')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        initCounters(data
          ? { adotados: data.adotados, disponiveis: data.disponiveis, mes: data.adotados_mes }
          : {});
      })
      .catch(() => initCounters());
  }
  if (body.dataset.page === 'sobre') {
    initTeamAccordion();
  }
  if (body.dataset.page === 'adopt') {
    import('./adote-um-gatinho.js').then(m => m.init());
  }

  if (body.dataset.page === 'announce') {
    initImageUpload();
    initAnnounceForm();
  }
});

/** Announce form: full client-side validation + success state */
function initAnnounceForm() {
  const form    = document.querySelector('.form-announce');
  const success = document.querySelector('.form-success');
  if (!form) return;

  // ── Clear individual field error as user corrects it
  form.addEventListener('input', e => { clearFieldError(e.target); });
  form.addEventListener('change', e => {
    clearFieldError(e.target);
    if (e.target.name === 'tipo-doador') {
      clearDonorGridError(form);
      applyDonorTypeUI(e.target.value);
    }
    if (e.target.id === 'chk-vacinado') updateDocReveal('vacina',    e.target.checked);
    if (e.target.id === 'chk-castrado') updateDocReveal('castracao', e.target.checked);
  });

  // Apply UI state for the default checked donor type
  const initialDonorType = form.querySelector('input[name="tipo-doador"]:checked')?.value ?? '';
  if (initialDonorType) applyDonorTypeUI(initialDonorType);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearAllErrors(form);

    const errors = [];
    const donorType = form.querySelector('input[name="tipo-doador"]:checked')?.value ?? '';

    // 1. Trim text inputs
    ['nome-gatinho', 'idade-gatinho', 'nome-doador', 'cidade-doador', 'especial-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = el.value.trim();
    });

    // 2. Cat basic info — name is optional; default to "Sem nome"
    const nomeInput = document.getElementById('nome-gatinho');
    if (nomeInput && !nomeInput.value.trim()) nomeInput.value = 'Sem nome';
    addIfEmpty('cor-gatinho',   'Padrão de pelagem é obrigatório',    errors);
    addIfEmpty('sexo-gatinho',  'Sexo é obrigatório',                 errors);
    addIfEmpty('idade-gatinho', 'Idade do gatinho é obrigatória',     errors);

    // 3. Donor type (radio)
    if (!donorType) {
      const grid = form.querySelector('.donor-type-grid');
      if (grid) {
        grid.classList.add('donor-grid--error');
        if (!grid.nextElementSibling?.classList.contains('field-error-msg')) {
          const p = document.createElement('p');
          p.className = 'field-error-msg';
          p.textContent = 'Selecione quem está doando o gatinho';
          grid.insertAdjacentElement('afterend', p);
        }
      }
      errors.push('tipo-doador');
    }

    // 4. Contact
    addIfEmpty('nome-doador',   'Seu nome é obrigatório',             errors);
    addIfEmpty('cidade-doador', 'Cidade / Estado é obrigatório',      errors);

    // 5. WhatsApp (non-ONG) or ONG link
    if (donorType === 'ong') {
      const ongInput = document.getElementById('ong-link-contact');
      const ongVal   = ongInput?.value.trim() ?? '';
      if (!ongVal) {
        addFieldError(ongInput, 'Link da ONG é obrigatório', errors);
      } else if (!isPublicUrl(ongVal)) {
        addFieldError(ongInput, 'Use um endereço público com https://', errors);
      }
    } else {
      addIfEmpty('whatsapp-doador', 'WhatsApp é obrigatório', errors);
    }

    // 6. Email (required when not ONG)
    const emailEl  = document.getElementById('email-doador');
    const emailVal = emailEl?.value.trim() ?? '';
    if (donorType !== 'ong') {
      if (!emailVal) {
        addFieldError(emailEl, 'E-mail é obrigatório', errors);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal)) {
        addFieldError(emailEl, 'Informe um e-mail válido (ex: voce@gmail.com)', errors);
      }
    }

    // 7. Documentos veterinários — obrigatórios para não-ONGs quando marcados
    if (donorType !== 'ong') {
      if (form.querySelector('#chk-vacinado')?.checked && !document.getElementById('doc-vacina')?.files[0]) {
        const wrap = document.getElementById('doc-vacina-wrap');
        if (wrap && !wrap.querySelector('.field-error-msg')) {
          const p = document.createElement('p');
          p.className = 'field-error-msg';
          p.textContent = 'Envie a caderneta de vacinação';
          wrap.appendChild(p);
        }
        errors.push('doc-vacina');
      }
      if (form.querySelector('#chk-castrado')?.checked && !document.getElementById('doc-castracao')?.files[0]) {
        const wrap = document.getElementById('doc-castracao-wrap');
        if (wrap && !wrap.querySelector('.field-error-msg')) {
          const p = document.createElement('p');
          p.className = 'field-error-msg';
          p.textContent = 'Envie o atestado de castração';
          wrap.appendChild(p);
        }
        errors.push('doc-castracao');
      }
    }

    // ── Show errors or proceed to success
    if (errors.length > 0) {
      const banner = document.createElement('div');
      banner.className = 'form-error-banner';
      banner.setAttribute('role', 'alert');
      const n = errors.length;
      banner.textContent = n === 1
        ? 'Preencha o campo obrigatório destacado antes de publicar.'
        : `Preencha os ${n} campos obrigatórios destacados antes de publicar.`;
      form.prepend(banner);
      (form.querySelector('.field--error') ?? form.querySelector('.donor-grid--error'))
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // All valid — envia ao backend
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Publicando…';

    try {
      // 1a. Upload foto (primeira imagem selecionada, se houver)
      const fotos  = getUploadedFiles();
      const fotoUrl = fotos.length ? await uploadFile(fotos[0], 'foto') : null;

      // 1b. Upload de documentos veterinários (opcionais)
      const docVacinaFile    = document.getElementById('doc-vacina')?.files[0]    ?? null;
      const docCastracaoFile = document.getElementById('doc-castracao')?.files[0] ?? null;
      const docProtetorFile  = document.getElementById('doc-protetor')?.files[0]  ?? null;

      const [docVacinaUrl, docCastracaoUrl, docProtetorUrl] = await Promise.all([
        docVacinaFile    ? uploadFile(docVacinaFile,    'doc') : Promise.resolve(null),
        docCastracaoFile ? uploadFile(docCastracaoFile, 'doc') : Promise.resolve(null),
        docProtetorFile  ? uploadFile(docProtetorFile,  'doc') : Promise.resolve(null),
      ]);

      // 2. Monta payload
      const payload = {
        nome_gatinho:          document.getElementById('nome-gatinho')?.value.trim() || 'Sem nome',
        padrao_pelagem:        document.getElementById('cor-gatinho')?.value,
        sexo:                  document.getElementById('sexo-gatinho')?.value,
        idade:                 document.getElementById('idade-gatinho')?.value.trim(),
        descricao:             document.getElementById('descricao')?.value.trim() || '',
        foto_url:              fotoUrl,
        nome_doador:           document.getElementById('nome-doador')?.value.trim(),
        cidade:                document.getElementById('cidade-doador')?.value.trim(),
        castrado:              form.querySelector('#chk-castrado')?.checked        ?? false,
        vacinado:              form.querySelector('#chk-vacinado')?.checked        ?? false,
        vermifugado:           form.querySelector('[name="vermifugado"]')?.checked  ?? false,
        microchipado:          form.querySelector('[name="micropchip"]')?.checked   ?? false,
        fiv_felv:              form.querySelector('[name="fiv-felv"]')?.checked     ?? false,
        socializavel: form.querySelector('[name="socializavel"]')?.checked ?? false,
        idoso:                 form.querySelector('#tag-idoso')?.checked            ?? false,
        condicao_especial:     form.querySelector('#tag-especial')?.checked         ?? false,
        especial_desc:         document.getElementById('especial-desc')?.value.trim() || undefined,
        doc_vacina_url:    docVacinaUrl,
        doc_castracao_url: docCastracaoUrl,
        tipo_doador:       donorType,
      };

      if (donorType === 'ong') {
        payload.ong_link_contact = document.getElementById('ong-link-contact')?.value.trim();
        if (emailVal) payload.email = emailVal;
      } else {
        payload.whatsapp = (document.getElementById('whatsapp-doador')?.value ?? '').replace(/\D/g, '');
        payload.email    = emailVal;
        if (donorType === 'protetor-registrado') payload.doc_protetor_url = docProtetorUrl;
      }

      // 3. Cria o anúncio
      const res  = await fetch('/api/anuncios', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        let msg = 'Erro ao publicar anúncio';
        if (typeof json.error === 'string') {
          msg = json.error;
        } else if (json.error?.fieldErrors || json.error?.formErrors) {
          const fieldMsgs = Object.entries(json.error.fieldErrors ?? {})
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('; ');
          msg = `Dados inválidos — ${fieldMsgs || (json.error.formErrors ?? []).join(', ') || 'verifique os campos'}`;
        }
        throw new Error(msg);
      }

      // 4. Sucesso
      const tip = document.getElementById('email-whitelist-tip');
      if (tip) tip.hidden = donorType === 'ong' || !emailVal;
      form.style.display = 'none';
      success?.classList.add('is-visible');
      success?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      form.querySelector('.form-error-banner')?.remove();
      const banner = document.createElement('div');
      banner.className = 'form-error-banner';
      banner.setAttribute('role', 'alert');
      banner.textContent = err.message || 'Ocorreu um erro inesperado. Tente novamente.';
      form.prepend(banner);
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Publicar Anúncio';
    }
  });

  // ── Gerar descrição com IA ───────────────────────────────────────────
  form.querySelector('.btn-ai')?.addEventListener('click', async function () {
    const btn     = this;
    const pelagem = document.getElementById('cor-gatinho')?.value;
    const sexo    = document.getElementById('sexo-gatinho')?.value;
    const idade   = document.getElementById('idade-gatinho')?.value.trim();

    // Valida campos mínimos
    const missing = [];
    if (!pelagem) missing.push('Padrão de Pelagem');
    if (!sexo)    missing.push('Sexo');
    if (!idade)   missing.push('Idade');

    document.getElementById('ai-field-error')?.remove();
    if (missing.length) {
      const p = Object.assign(document.createElement('p'), {
        id:        'ai-field-error',
        className: 'field-hint',
        textContent: `Preencha antes de usar a IA: ${missing.join(', ')}`,
      });
      p.style.cssText = 'color:var(--c-error,#cc3333);margin-top:.25rem';
      btn.insertAdjacentElement('afterend', p);
      return;
    }

    const originalHTML = btn.innerHTML;
    btn.disabled  = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Gerando…';

    try {
      const body = {
        padrao_pelagem:        pelagem,
        sexo,
        idade,
        nome_gatinho:          document.getElementById('nome-gatinho')?.value.trim()       || undefined,
        vacinado:              form.querySelector('#chk-vacinado')?.checked                 ?? false,
        castrado:              form.querySelector('#chk-castrado')?.checked                 ?? false,
        vermifugado:           form.querySelector('[name="vermifugado"]')?.checked           ?? false,
        fiv_felv:              form.querySelector('[name="fiv-felv"]')?.checked              ?? false,
        microchipado:          form.querySelector('[name="micropchip"]')?.checked            ?? false,
        socializavel: form.querySelector('[name="socializavel"]')?.checked          ?? false,
        idoso:                 form.querySelector('#tag-idoso')?.checked                     ?? false,
        condicao_especial:     form.querySelector('#tag-especial')?.checked                  ?? false,
        especial_desc:         document.getElementById('especial-desc')?.value.trim()        || undefined,
      };

      const res  = await fetch('/api/generate-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao gerar descrição');

      const textarea = document.getElementById('descricao');
      if (textarea) {
        textarea.value = json.description;
        textarea.dispatchEvent(new Event('input'));
      }
    } catch (err) {
      const p = Object.assign(document.createElement('p'), {
        id:        'ai-field-error',
        className: 'field-hint',
        textContent: err.message || 'Não foi possível gerar a descrição. Tente novamente.',
      });
      p.style.cssText = 'color:var(--c-error,#cc3333);margin-top:.25rem';
      btn.insertAdjacentElement('afterend', p);
    } finally {
      btn.disabled  = false;
      btn.innerHTML = originalHTML;
    }
  });

  // ── Helpers ──────────────────────────────────────────────────────────

  function updateDocReveal(type, checked) {
    const isOng = form.querySelector('input[name="tipo-doador"]:checked')?.value === 'ong';
    const wrap  = document.getElementById(`doc-${type}-wrap`);
    if (wrap) wrap.hidden = isOng || !checked;
  }

  function applyDonorTypeUI(type) {
    const isOng  = type === 'ong';
    const isProt = type === 'protetor-registrado';

    const whatsappWrap    = document.getElementById('whatsapp-field-wrap');
    const ongLinkWrap     = document.getElementById('ong-link-field-wrap');
    const docProtetorWrap = document.getElementById('doc-protetor-wrap');
    const emailLabel      = document.getElementById('email-label');
    const emailOngNote    = document.getElementById('email-ong-note');
    const whatsappInput   = document.getElementById('whatsapp-doador');

    if (whatsappWrap)    whatsappWrap.hidden    = isOng;
    if (ongLinkWrap)     ongLinkWrap.hidden     = !isOng;
    if (docProtetorWrap) docProtetorWrap.hidden = !isProt;
    if (emailLabel)      emailLabel.classList.toggle('field-required', !isOng);
    if (emailOngNote)    emailOngNote.hidden    = !isOng;
    if (whatsappInput)   whatsappInput.required = !isOng;

    // ONGs são isentas de comprovação documental veterinária
    const vacinadoChecked = document.getElementById('chk-vacinado')?.checked ?? false;
    const castradoChecked = document.getElementById('chk-castrado')?.checked ?? false;
    const docVacinaWrap    = document.getElementById('doc-vacina-wrap');
    const docCastracaoWrap = document.getElementById('doc-castracao-wrap');
    if (docVacinaWrap)    docVacinaWrap.hidden    = isOng || !vacinadoChecked;
    if (docCastracaoWrap) docCastracaoWrap.hidden = isOng || !castradoChecked;
  }

  function addIfEmpty(id, msg, errors) {
    const el = document.getElementById(id);
    if (!el || el.closest('[hidden]')) return;
    if (!el.value.trim()) addFieldError(el, msg, errors);
  }

  function addFieldError(el, msg, errors) {
    if (!el) return;
    const wrap = el.closest('.field');
    if (wrap) {
      wrap.classList.add('field--error');
      if (!wrap.querySelector('.field-error-msg')) {
        const p = document.createElement('p');
        p.className = 'field-error-msg';
        p.textContent = msg;
        wrap.appendChild(p);
      }
    }
    errors.push(el.id || msg);
  }

  function clearFieldError(target) {
    const wrap = target?.closest('.field');
    if (wrap?.classList.contains('field--error')) {
      wrap.classList.remove('field--error');
      wrap.querySelector('.field-error-msg')?.remove();
    }
  }

  function clearDonorGridError(form) {
    const grid = form.querySelector('.donor-type-grid');
    if (grid?.classList.contains('donor-grid--error')) {
      grid.classList.remove('donor-grid--error');
      const next = grid.nextElementSibling;
      if (next?.classList.contains('field-error-msg')) next.remove();
    }
  }

  function clearAllErrors(form) {
    form.querySelector('.form-error-banner')?.remove();
    form.querySelectorAll('.field--error').forEach(f => {
      f.classList.remove('field--error');
      f.querySelector('.field-error-msg')?.remove();
    });
    form.querySelectorAll('.doc-upload-reveal .field-error-msg').forEach(el => el.remove());
    clearDonorGridError(form);
  }

  function isPublicUrl(urlString) {
    try {
      const url = new URL(urlString);
      if (!['http:', 'https:'].includes(url.protocol)) return false;
      const h = url.hostname.toLowerCase();
      return !/^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|::1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(h);
    } catch { return false; }
  }
}

// ---------------------------------------------------------------------------
// Envia um File para o Supabase Storage via URL assinada.
// Retorna o path do arquivo dentro do bucket.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Galeria de fotos na seção "Adoção Responsável" — rotação a cada 30s
// Começa num slide aleatório para variar a cada carregamento de página.
// ---------------------------------------------------------------------------
function initResponsibleGallery() {
  const slides = Array.from(document.querySelectorAll('.gallery-slide'));
  const dots   = Array.from(document.querySelectorAll('.gallery-dot'));
  if (slides.length < 2) return;

  let current = Math.floor(Math.random() * slides.length);

  // Apply random starting slide (HTML already has slide 0 as active)
  slides.forEach((s, i) => s.classList.toggle('active', i === current));
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === current);
    d.setAttribute('aria-selected', i === current ? 'true' : 'false');
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  setInterval(() => goTo(current + 1), 30_000);
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
}

async function uploadFile(file, bucketType) {
  const urlRes = await fetch('/api/upload-url', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      filename:    file.name,
      contentType: file.type,
      bucketType,
    }),
  });
  if (!urlRes.ok) {
    const e = await urlRes.json().catch(() => ({}));
    throw new Error(e.error ?? 'Falha ao preparar upload do arquivo');
  }
  const { signedUrl, path } = await urlRes.json();

  const uploadRes = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': file.type },
    body:    file,
  });
  if (!uploadRes.ok) throw new Error(`Falha ao enviar ${file.name}`);

  return path;
}
