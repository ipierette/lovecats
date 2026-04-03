/**
 * app.js — LoveCats main entry point (ES module)
 * Imported via <script type="module"> on every page.
 */

import { initTheme }       from './modules/theme.js';
import { initNav }         from './modules/nav.js';
import { initAnimations, initCounters } from './modules/animations.js';
import { initFilters }     from './modules/filters.js';
import { initImageUpload } from './modules/imageUpload.js';
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
    // TODO: substituir pelos valores reais do Supabase quando a integração estiver ativa.
    // Exemplo de chamada:
    //   const { data } = await supabase.from('stats_anuncios').select('*').single();
    //   initCounters({ adotados: data.total_adotados, disponiveis: data.total_disponiveis, mes: data.adocoes_mes_atual });
    initCounters();
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
    if (e.target.name === 'tipo-doador') clearDonorGridError(form);
  });

  form.addEventListener('submit', e => {
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

    // All valid
    const tip = document.getElementById('email-whitelist-tip');
    if (tip) tip.hidden = donorType === 'ong' || !emailVal;
    form.style.display = 'none';
    success?.classList.add('is-visible');
    success?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ── Helpers ──────────────────────────────────────────────────────────

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
