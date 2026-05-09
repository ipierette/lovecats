/* ============================================================
   LoveCats — Adote um Gatinho
   Busca anúncios da API e renderiza cards com filtros client-side
   ============================================================ */

// Cats loaded from the API — populated by fetchCats()
let allCats = [];

// ── Age bucket ──────────────────────────────────────────────
function parseAgeBucket(s, idoso) {
  if (idoso) return 'senior';
  if (!s) return 'adulto';
  const lower = s.toLowerCase();
  const mMatch = lower.match(/(\d+)\s*(?:a\s*\d+\s*)?m[eê]s/);
  if (mMatch) {
    const m = parseInt(mMatch[1], 10);
    return m < 6 ? 'filhote' : m <= 12 ? 'jovem' : 'adulto';
  }
  const yMatch = lower.match(/(\d+)\s*ano/);
  if (yMatch) {
    const y = parseInt(yMatch[1], 10);
    if (y === 0) return 'filhote';
    if (y === 1) return 'jovem';
    if (y >= 7)  return 'senior';
    return 'adulto';
  }
  if (lower.includes('filhote')) return 'filhote';
  if (lower.includes('s\u00eanior') || lower.includes('senior') || lower.includes('idoso')) return 'senior';
  return 'adulto';
}

// Normalize API row → internal shape used by render functions
function normalizeCat(raw) {
  // 'Fêmea' → 'femea', 'Macho' → 'macho'
  const sexKey = (raw.sexo ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return {
    id:               raw.id,
    name:             raw.nome_gatinho,
    color:            raw.padrao_pelagem,
    sex:              sexKey,
    sexLabel:         raw.sexo,
    age:              parseAgeBucket(raw.idade, raw.idoso),
    ageLabel:         raw.idade,
    vacinado:         raw.vacinado,
    castrado:         raw.castrado,
    vermifugado:      raw.vermifugado,
    microchip:        raw.microchip,
    fivFelv:          raw.testado_fiv_felv,
    socializavel:     raw.socializavel,
    idoso:            raw.idoso,
    condicaoEspecial: raw.condicao_especial,
    condicaoDesc:     raw.condicao_especial_descricao,
    city:             raw.cidade,
    img:              raw.foto_url,
    whatsapp:         raw.whatsapp,
    ongUrl:           raw.ong_link_contact,
    contact:          raw.nome_doador,
    description:      raw.descricao || '',
    donorType:        raw.tipo_doador,
    docVacinaUrl:     raw.doc_vacina_url,
    docCastracaoUrl:  raw.doc_castracao_url,
    docProtetorUrl:   raw.doc_protetor_url,
  };
}

// ── Fetch ────────────────────────────────────────────────────
async function fetchCats() {
  setGridState('loading');
  try {
    const res = await fetch('/api/cats?limit=48');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    allCats = (json.data ?? []).map(normalizeCat);
    applyFilters();
  } catch (err) {
    console.error('[adote] Erro ao buscar anúncios:', err);
    setGridState('error');
  }
}

// ── Grid state helpers ───────────────────────────────────────
function setGridState(state) {
  const grid = document.querySelector('.cats-grid');
  if (!grid) return;
  if (state === 'loading') {
    grid.innerHTML = `<p class="cats-empty cats-loading">Buscando gatinhos disponíveis…</p>`;
    updateCount(0, true);
  } else if (state === 'error') {
    grid.innerHTML = `<p class="cats-empty">Não foi possível carregar os anúncios. Tente recarregar a página.</p>`;
    updateCount(0, true);
  }
}

const PIN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e8e0d8'/%3E%3Ctext x='50%25' y='50%25' font-size='64' text-anchor='middle' dominant-baseline='central'%3E🐱%3C/text%3E%3C/svg%3E`;

// ── Card renderer ────────────────────────────────────────────
function catCardHTML(cat, index) {
  const waMsg = encodeURIComponent(`Olá! Tenho interesse em adotar ${cat.sex === 'femea' ? 'a' : 'o'} ${cat.name}.`);
  const waUrl = cat.whatsapp ? `https://wa.me/${cat.whatsapp}?text=${waMsg}` : '#';

  const vacLabel = cat.sex === 'femea' ? 'Vacinada' : 'Vacinado';
  const neuLabel = cat.sex === 'femea' ? 'Castrada' : 'Castrado';

  const badges = [
    cat.vacinado ? `<span class="badge badge-vac">${vacLabel}</span>` : '',
    cat.castrado ? `<span class="badge badge-neu">${neuLabel}</span>` : '',
  ].filter(Boolean).join('\n');

  const colorLabel = {
    solido: 'Sólido', tigrado: 'Tigrado', bicolor: 'Bicolor',
    tricolor: 'Tricolor / Calico', tartaruga: 'Tartaruga', colorpoint: 'Colorpoint',
  }[cat.color] ?? cat.color;

  const donorChipMap = {
    'resgate-informal':    { label: 'Resgate Informal',    cls: 'resgate' },
    'protetor-registrado': { label: 'Protetor Registrado', cls: 'protetor' },
    'ong':                 { label: 'ONG',                 cls: 'ong' },
  };
  const donor = donorChipMap[cat.donorType] ?? donorChipMap['resgate-informal'];
  const donorChip = `<span class="cat-card__donor-chip cat-card__donor-chip--${donor.cls}">${donor.label}</span>`;

  const contactLabel = cat.donorType === 'ong' ? 'Ver na ONG' : 'Adotar';
  const contactBtn = `<button class="btn btn-primary cat-card__adopt-btn" style="flex:1;justify-content:center;" data-cat-index="${index}">${contactLabel}</button>`;

  const imgSrc = cat.img ?? FALLBACK_IMG;
  const imgAlt = `${cat.name} — ${cat.sexLabel ?? cat.sex} ${colorLabel}`;

  return `
    <article class="cat-card" role="listitem"
      data-name="${cat.name}" data-color="${cat.color}" data-sex="${cat.sex}"
      data-age="${cat.age}" data-vacinado="${cat.vacinado}" data-castrado="${cat.castrado}"
      data-donor-type="${cat.donorType}">
      <div class="cat-card__img-wrap">
        <img src="${imgSrc}" alt="${imgAlt}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'" />
        ${badges ? `<div class="cat-card__badges">${badges}</div>` : ''}
      </div>
      <div class="cat-card__body">
        <h2 class="cat-card__name">${cat.name}</h2>
        <div class="cat-card__meta">
          <span class="cat-card__meta-item">${colorLabel}</span>
          <span class="cat-card__meta-item">${cat.sexLabel ?? cat.sex}</span>
          <span class="cat-card__meta-item">${cat.ageLabel}</span>
        </div>
        <p class="cat-card__location">
          ${PIN_SVG}
          ${cat.city}
        </p>
        ${donorChip}
        <div class="btn-contact">
          <button class="btn btn-secondary cat-card__details-btn" style="flex:1;" data-cat-index="${index}">
            Saiba Mais
          </button>
          ${contactBtn}
        </div>
      </div>
    </article>`;
}

// ── Render ───────────────────────────────────────────────────
function renderCats(list) {
  const grid = document.querySelector('.cats-grid');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = `<p class="cats-empty">Nenhum gatinho encontrado com os filtros selecionados.</p>`;
  } else {
    grid.innerHTML = list.map((cat, i) => catCardHTML(cat, allCats.indexOf(cat))).join('');
  }
}

function updateCount(n, loading = false) {
  const el = document.querySelector('.cats-count');
  if (!el) return;
  if (loading) { el.innerHTML = ''; return; }
  el.innerHTML = `<strong>${n}</strong> ${n === 1 ? 'gatinho encontrado' : 'gatinhos encontrados'}`;
}

// ── Filters ──────────────────────────────────────────────────
function applyFilters() {
  const cor      = document.getElementById('cor-filter')?.value ?? '';
  const sexo     = document.getElementById('sexo-filter')?.value ?? '';
  const idade    = document.getElementById('idade-filter')?.value ?? '';
  const doador   = document.getElementById('doador-filter')?.value ?? '';
  const vacCheck = document.getElementById('filtro-vacinado')?.checked ?? false;
  const neuCheck = document.getElementById('filtro-castrado')?.checked ?? false;

  const result = allCats.filter(cat => {
    if (cor    && cat.color     !== cor)    return false;
    if (sexo   && cat.sex       !== sexo)   return false;
    if (idade  && cat.age       !== idade)  return false;
    if (doador && cat.donorType !== doador) return false;
    if (vacCheck && !cat.vacinado) return false;
    if (neuCheck && !cat.castrado) return false;
    return true;
  });

  renderCats(result);
  updateCount(result.length);
}

function resetFilters() {
  ['cor-filter', 'sexo-filter', 'idade-filter', 'doador-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['filtro-vacinado', 'filtro-castrado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  applyFilters();
}

// ── Modal ────────────────────────────────────────────────────
function openModal(cat) {
  const modal = document.getElementById('cat-modal');
  if (!modal) return;

  const waMsg = encodeURIComponent(`Olá! Tenho interesse em adotar ${cat.sex === 'femea' ? 'a' : 'o'} ${cat.name}.`);
  const waUrl = `https://wa.me/${cat.whatsapp}?text=${waMsg}`;

  const colorLabel = {
    solido: 'Sólido', tigrado: 'Tigrado', bicolor: 'Bicolor',
    tricolor: 'Tricolor / Calico', tartaruga: 'Tartaruga', colorpoint: 'Colorpoint',
  }[cat.color] ?? cat.color;

  const vacBadge = cat.vacinado
    ? `<span class="badge badge-vac">${cat.sex === 'femea' ? 'Vacinada' : 'Vacinado'}</span>` : '';
  const neuBadge = cat.castrado
    ? `<span class="badge badge-neu">${cat.sex === 'femea' ? 'Castrada' : 'Castrado'}</span>` : '';

  const imgSrc = cat.img ?? FALLBACK_IMG;
  modal.querySelector('.modal__img').src              = imgSrc;
  modal.querySelector('.modal__img').alt              = `${cat.name}`;
  modal.querySelector('.modal__img').onerror          = function () { this.src = FALLBACK_IMG; };
  modal.querySelector('.modal__name').textContent     = cat.name;
  modal.querySelector('.modal__badges').innerHTML     = vacBadge + neuBadge;
  modal.querySelector('.modal__description').textContent = cat.description;

  const healthRows = [
    `<tr><th>Vacinado</th><td>${cat.vacinado ? 'Sim' : 'Não'}</td></tr>`,
    `<tr><th>Castrado</th><td>${cat.castrado ? 'Sim' : 'Não'}</td></tr>`,
    cat.vermifugado ? `<tr><th>Vermifugado</th><td>Sim</td></tr>` : '',
    cat.microchip   ? `<tr><th>Microchip</th><td>Sim</td></tr>` : '',
    cat.fivFelv     ? `<tr><th>Testado FIV/FeLV</th><td>Sim</td></tr>` : '',
    cat.socializavel ? `<tr><th>Socializável</th><td>Sim</td></tr>` : '',
    cat.idoso        ? `<tr><th>Sênior</th><td>7+ anos</td></tr>` : '',
    cat.condicaoEspecial ? `<tr><th>Cond. especial</th><td>${cat.condicaoDesc ?? 'Sim'}</td></tr>` : '',
  ].filter(Boolean).join('');

  modal.querySelector('.modal__info-table').innerHTML = `
    <tr><th>Idade</th><td>${cat.ageLabel}</td></tr>
    <tr><th>Sexo</th><td>${cat.sexLabel ?? cat.sex}</td></tr>
    <tr><th>Pelagem</th><td>${colorLabel}</td></tr>
    <tr><th>Cidade</th><td>${cat.city}</td></tr>
    <tr><th>Doador</th><td>${cat.contact}</td></tr>
    ${healthRows}
  `;

  // Contact buttons — modal__adopt-btn now opens adoption intent modal
  const isOng    = cat.donorType === 'ong';
  const adoptBtn = modal.querySelector('.modal__adopt-btn');
  const ongBtn   = modal.querySelector('.modal__ong-btn');
  if (adoptBtn) {
    adoptBtn.hidden = isOng;
    // store cat data on the button for the adoption intent handler
    if (!isOng) {
      adoptBtn.dataset.catId        = cat.id;
      adoptBtn.dataset.whatsappUrl  = waUrl;
    }
  }
  if (ongBtn) {
    ongBtn.hidden = !isOng;
    if (isOng) {
      ongBtn.dataset.catId = cat.id;
      ongBtn.dataset.ongUrl = cat.ongUrl ?? '';
    }
  }

  // Docs section
  const docsEl  = document.getElementById('modal-docs');
  const docsBtn = document.getElementById('modal-docs-btn');
  const docChips = [];
  if (cat.docVacinaUrl)    docChips.push(`<a class="modal__doc-chip" href="${cat.docVacinaUrl}" target="_blank" rel="noopener noreferrer">Caderneta de Vacinação</a>`);
  if (cat.docCastracaoUrl) docChips.push(`<a class="modal__doc-chip" href="${cat.docCastracaoUrl}" target="_blank" rel="noopener noreferrer">Atestado de Castração</a>`);
  if (cat.docProtetorUrl)  docChips.push(`<a class="modal__doc-chip" href="${cat.docProtetorUrl}" target="_blank" rel="noopener noreferrer">Comprovante de Protetor</a>`);

  if (docsEl) {
    if (docChips.length) {
      docsEl.innerHTML = `<p class="modal__docs-title">Documentação disponível</p><div class="modal__docs-chips">${docChips.join('')}</div><p class="modal__docs-hint">Documentos fornecidos pelo doador. Confirme presencialmente antes de concluir a adoção.</p>`;
      docsEl.hidden = true;
    } else {
      docsEl.innerHTML = '';
      docsEl.hidden = true;
    }
  }
  if (docsBtn) {
    docsBtn.hidden = !docChips.length;
    docsBtn.setAttribute('aria-expanded', 'false');
  }

  modal.removeAttribute('hidden');
  modal.setAttribute('aria-modal', 'true');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal__close')?.focus();
}

function closeModal() {
  const modal = document.getElementById('cat-modal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// ── Adoption Intent Modal ────────────────────────────────────
function openAdoptionModal(catId, destUrl, isOng = false) {
  const modal = document.getElementById('adoption-modal');
  if (!modal) return;
  document.getElementById('adoption-anuncio-id').value   = catId ?? '';
  document.getElementById('adoption-whatsapp-url').value = destUrl ?? '';
  document.getElementById('adopter-email').value = '';
  document.getElementById('adopter-email-error').hidden = true;
  document.getElementById('adopter-email').classList.remove('is-error');
  const label = document.getElementById('adoption-submit-label');
  if (label) label.textContent = isOng ? 'Confirmar e ver na ONG' : 'Confirmar e abrir WhatsApp';
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-modal', 'true');
  document.body.style.overflow = 'hidden';
  document.getElementById('adopter-email')?.focus();
}

function closeAdoptionModal() {
  const modal = document.getElementById('adoption-modal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// ── Init ─────────────────────────────────────────────────────
export function init() {
  // Wire up filters
  ['cor-filter', 'sexo-filter', 'idade-filter', 'doador-filter', 'filtro-vacinado', 'filtro-castrado'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  document.querySelector('.filters-panel__reset')?.addEventListener('click', resetFilters);

  // Card grid delegation: "Saiba Mais" → cat detail modal | "Adotar" → adoption intent modal
  document.querySelector('.cats-grid')?.addEventListener('click', e => {
    const detailBtn = e.target.closest('.cat-card__details-btn');
    if (detailBtn) {
      const idx = parseInt(detailBtn.dataset.catIndex, 10);
      if (!isNaN(idx) && allCats[idx]) openModal(allCats[idx]);
      return;
    }
    const adoptBtn = e.target.closest('.cat-card__adopt-btn');
    if (adoptBtn) {
      const idx = parseInt(adoptBtn.dataset.catIndex, 10);
      if (!isNaN(idx) && allCats[idx]) {
        const cat   = allCats[idx];
        const isOng = cat.donorType === 'ong';
        const waMsg = encodeURIComponent(`Olá! Tenho interesse em adotar ${cat.sex === 'femea' ? 'a' : 'o'} ${cat.name}.`);
        const destUrl = isOng
          ? (cat.ongUrl ?? '')
          : (cat.whatsapp ? `https://wa.me/${cat.whatsapp}?text=${waMsg}` : '');
        openAdoptionModal(cat.id, destUrl, isOng);
      }
    }
  });

  // Cat detail modal: adopt button → open adoption intent modal
  const detailModal = document.getElementById('cat-modal');
  if (detailModal) {
    detailModal.querySelector('.modal__close')?.addEventListener('click', closeModal);
    detailModal.querySelector('.modal__overlay')?.addEventListener('click', closeModal);

    detailModal.addEventListener('click', e => {
      const adoptBtn = e.target.closest('.modal__adopt-btn');
      if (adoptBtn) {
        closeModal();
        openAdoptionModal(adoptBtn.dataset.catId, adoptBtn.dataset.whatsappUrl, false);
        return;
      }
      const ongBtn = e.target.closest('.modal__ong-btn');
      if (ongBtn) {
        e.preventDefault();
        closeModal();
        openAdoptionModal(ongBtn.dataset.catId, ongBtn.dataset.ongUrl, true);
      }
    });

    detailModal.querySelector('#modal-docs-btn')?.addEventListener('click', () => {
      const docsEl = document.getElementById('modal-docs');
      const btn    = document.getElementById('modal-docs-btn');
      if (!docsEl || !btn) return;
      const opening = docsEl.hidden;
      docsEl.hidden = !opening;
      btn.setAttribute('aria-expanded', String(opening));
      if (opening) {
        setTimeout(() => docsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!detailModal.hasAttribute('hidden')) closeModal();
        if (!document.getElementById('adoption-modal')?.hasAttribute('hidden')) closeAdoptionModal();
      }
    });
  }

  // Adoption intent modal
  const adoptionModal = document.getElementById('adoption-modal');
  if (adoptionModal) {
    document.getElementById('adoption-modal-close')?.addEventListener('click', closeAdoptionModal);
    adoptionModal.querySelector('.modal__overlay')?.addEventListener('click', closeAdoptionModal);

    document.getElementById('adoption-intent-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const emailInput = document.getElementById('adopter-email');
      const errorEl    = document.getElementById('adopter-email-error');
      const submitBtn  = document.getElementById('adoption-intent-submit');
      const anuncioId  = document.getElementById('adoption-anuncio-id').value;
      const waUrl      = document.getElementById('adoption-whatsapp-url').value;

      emailInput.classList.remove('is-error');
      errorEl.hidden = true;

      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        emailInput.classList.add('is-error');
        errorEl.textContent = 'Informe um e-mail válido.';
        errorEl.hidden = false;
        emailInput.focus();
        return;
      }

      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';

      try {
        const res = await fetch('/api/adoption-intent', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ anuncio_id: anuncioId, email_adotante: email }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Erro ao registrar interesse.');
        }
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        return;
      }

      // Sucesso: fecha modal e abre WhatsApp
      closeAdoptionModal();
      if (waUrl) window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Load data from API
  fetchCats();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
