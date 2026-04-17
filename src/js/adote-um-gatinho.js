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

  const contactBtn = cat.donorType === 'ong'
    ? `<a href="${cat.ongUrl ?? '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;justify-content:center;">Ver na ONG</a>`
    : `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;justify-content:center;">Adotar</a>`;

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

  // Contact buttons
  const isOng    = cat.donorType === 'ong';
  const adoptBtn = modal.querySelector('.modal__adopt-btn');
  const ongBtn   = modal.querySelector('.modal__ong-btn');
  if (adoptBtn) { adoptBtn.hidden = isOng; if (!isOng) adoptBtn.href = waUrl; }
  if (ongBtn)   { ongBtn.hidden = !isOng; if (isOng && cat.ongUrl) ongBtn.href = cat.ongUrl; }

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

// ── Init ─────────────────────────────────────────────────────
export function init() {
  // Wire up filters
  ['cor-filter', 'sexo-filter', 'idade-filter', 'doador-filter', 'filtro-vacinado', 'filtro-castrado'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  document.querySelector('.filters-panel__reset')?.addEventListener('click', resetFilters);

  // Modal delegation on card grid
  document.querySelector('.cats-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('.cat-card__details-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.catIndex, 10);
    if (!isNaN(idx) && allCats[idx]) openModal(allCats[idx]);
  });

  // Modal close handlers
  const modal = document.getElementById('cat-modal');
  if (modal) {
    modal.querySelector('.modal__close')?.addEventListener('click', closeModal);
    modal.querySelector('.modal__overlay')?.addEventListener('click', closeModal);

    modal.querySelector('#modal-docs-btn')?.addEventListener('click', () => {
      const docsEl = document.getElementById('modal-docs');
      const btn    = document.getElementById('modal-docs-btn');
      if (!docsEl || !btn) return;
      docsEl.hidden = !docsEl.hidden;
      btn.setAttribute('aria-expanded', String(!docsEl.hidden));
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
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
  {
    name: 'Mel',
    color: 'solido',
    sex: 'femea',
    age: 'filhote',
    ageLabel: '3 meses',
    vacinado: true,
    castrado: false,
    city: 'São Paulo, SP',
    img: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Mel — gatinha laranja de 3 meses',
    whatsapp: '5511999999991',
    contact: 'Ana Lima',
    description: 'A Mel é uma gatinha laranjinha super carinhosa e brincalhona. É ótima com crianças e já está acostumada a viver em apartamento. Adora colo e ronrona muito. Veio de resgate de rua com apenas 15 dias, foi mamadeira e cresceu saudável. Está vacinada com V4 e pronta para adoção responsável.',
    donorType: 'resgate-informal',
  },
  {
    name: 'Shadow',
    color: 'bicolor',
    sex: 'macho',
    age: 'jovem',
    ageLabel: '1 ano',
    vacinado: true,
    castrado: true,
    city: 'Rio de Janeiro, RJ',
    img: 'https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Shadow — gato preto de 1 ano',
    whatsapp: '5521999999992',
    contact: 'Carlos Mendes',
    description: 'O Shadow é um jovem gato preto de personalidade tranquila e reservada. Prefere ambientes calmos e um tutor paciente. Já está castrado, vacinado com V5 e micro-chipeado. Se dá bem com outros gatos desde que a apresentação seja feita com calma. Ama janelas e observar passarinhos.',
    donorType: 'protetor-registrado',
    docProtetor: true,
  },
  {
    name: 'Nuvem',
    color: 'solido',
    sex: 'femea',
    age: 'filhote',
    ageLabel: '2 meses',
    vacinado: false,
    castrado: false,
    city: 'Belo Horizonte, MG',
    img: 'https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Nuvem — gatinha branca de 2 meses',
    whatsapp: '5531999999993',
    contact: 'Fernanda Rocha',
    description: 'A Nuvem ainda é muito novinha — tem apenas 2 meses e precisa de um lar com muita paciência e amor. É branca com olhos azuis e pode ser parcialmente surda (característica comum em gatos brancos de olhos azuis — isso não impede uma vida plena). Ainda não está vacinada, mas o veterinário já está acompanhando.',
    donorType: 'resgate-informal',
  },
  {
    name: 'Tigre',
    color: 'tigrado',
    sex: 'macho',
    age: 'filhote',
    ageLabel: '5 meses',
    vacinado: true,
    castrado: false,
    city: 'São Paulo, SP',
    img: 'https://placecats.com/neo/300/200',
    imgAlt: 'Tigre — gato tigrado de 5 meses',
    whatsapp: '5511999999994',
    contact: 'Roberto Galhardo',
    description: 'O Tigre é um filhote tigrado cheio de energia e personalidade. Adora brincar com praticamente tudo e vai amar crescer em um lar ativo. Está bem socializado, vacinado com V4 e pronto para castração em breve. Indicado para tutores que querem um gato interativo e divertido.',
    donorType: 'resgate-informal',
  },
  {
    name: 'Luna',
    color: 'solido',
    sex: 'femea',
    age: 'adulto',
    ageLabel: '2 anos',
    vacinado: true,
    castrado: true,
    city: 'São Paulo, SP',
    img: 'https://images.pexels.com/photos/1643457/pexels-photo-1643457.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Luna — gatinha cinza de 2 anos',
    whatsapp: '5511999999995',
    contact: 'Daniela Souza',
    description: 'A Luna é uma gata adulta cinza de olhos esverdeados, extremamente dócil e carinhosa. É calma, não briga com outros animais e adora dormir pertinho do tutor. Já está castrada, vacinada com V5 e tem acompanhamento veterinário em dia. Disponível para adoção por motivo de mudança de país da tutora.',
    donorType: 'protetor-registrado',
    docProtetor: true,
  },
  {
    name: 'Caramelo',
    color: 'tigrado',
    sex: 'macho',
    age: 'filhote',
    ageLabel: '4 meses',
    vacinado: true,
    castrado: false,
    city: 'São Paulo, SP',
    img: 'https://images.pexels.com/photos/2181171/pexels-photo-2181171.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Caramelo — gato laranja de 4 meses',
    whatsapp: '5511999999996',
    contact: 'Marcelo Dias',
    description: 'O Caramelo é um filhote laranjão guloso e barulhento — mia muito antes de comer e fica animado com qualquer barulho. Foi resgatado de um terreno baldio com 30 dias de vida. Vacinado com V4, sem castração pois ainda é jovem. Indicado para lares com energia e disposição para brincar bastante.',
    donorType: 'resgate-informal',
  },
  {
    name: 'Mia',
    color: 'tricolor',
    sex: 'femea',
    age: 'filhote',
    ageLabel: '5 meses',
    vacinado: false,
    castrado: false,
    city: 'Salvador, BA',
    img: 'https://images.pexels.com/photos/34026607/pexels-photo-34026607.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Mia — gatinha malhada de 5 meses',
    whatsapp: null,
    contact: 'Asso. Salve Vidas',
    ongUrl: 'https://assavida.org.br/adocao/mia',
    description: 'A Mia é uma filhote malhada muito esperta e curiosa. Explora cada cantinho da casa e adora subir em lugares altos. Ainda não está vacinada — o adotante deve arcar com a primeira dose de V4 e vermifugação (combinado na entrega). Já está acostumada com caixa de areia e comedouros separados.',
    donorType: 'ong',
  },
  {
    name: 'Thor',
    color: 'solido',
    sex: 'macho',
    age: 'adulto',
    ageLabel: '3 anos',
    vacinado: true,
    castrado: true,
    city: 'Fortaleza, CE',
    img: 'https://images.pexels.com/photos/33337218/pexels-photo-33337218.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Thor — gato laranja de 3 anos',
    whatsapp: null,
    contact: 'ONG Amigos Peludos',
    ongUrl: 'https://amigospeludos.org.br/adocao/thor',
    description: 'O Thor é um gato adulto laranja enorme e manso — pesa 5 kg e tem uma personalidade calmíssima. Adora colo acima de qualquer coisa e é excelente companheiro para quem vive sozinho. Está castrado, vacinado com V5 e vermifugado. Precisa de lar calmo, de preferência sem crianças pequenas muito agitadas.',
    donorType: 'ong',
  },
];

const PIN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

function catCardHTML(cat, index) {
  const waMsg = encodeURIComponent(`Olá! Tenho interesse em adotar ${cat.sex === 'femea' ? 'a' : 'o'} ${cat.name}.`);
  const waUrl = cat.whatsapp ? `https://wa.me/${cat.whatsapp}?text=${waMsg}` : '#';
  const vacLabel = cat.sex === 'femea' ? 'Vacinada' : 'Vacinado';
  const neuLabel = cat.sex === 'femea' ? 'Castrada' : 'Castrado';

  const badges = [
    cat.vacinado ? `<span class="badge badge-vac">${vacLabel}</span>` : '',
    cat.castrado ? `<span class="badge badge-neu">${neuLabel}</span>` : '',
  ].filter(Boolean).join('\n                    ');

  const colorLabel = {
    solido: 'Sólido', tigrado: 'Tigrado', bicolor: 'Bicolor',
    tricolor: 'Tricolor / Calico', tartaruga: 'Tartaruga', colorpoint: 'Colorpoint',
  }[cat.color] ?? cat.color;

  const sexLabel = cat.sex === 'femea' ? 'Fêmea' : 'Macho';

  const donorType = cat.donorType ?? 'resgate-informal';
  const donorChipMap = {
    'resgate-informal':    { label: 'Resgate Informal',    cls: 'resgate' },
    'protetor-registrado': { label: 'Protetor Registrado', cls: 'protetor' },
    'ong':                 { label: 'ONG',                 cls: 'ong' },
  };
  const donor = donorChipMap[donorType] ?? donorChipMap['resgate-informal'];
  const donorChip = `<span class="cat-card__donor-chip cat-card__donor-chip--${donor.cls}">${donor.label}</span>`;

  const contactBtn = donorType === 'ong'
    ? `<a href="${cat.ongUrl ?? '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;justify-content:center;">Ver na ONG</a>`
    : `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="flex:1;justify-content:center;">Adotar</a>`;

  return `
              <article class="cat-card" role="listitem"
                data-name="${cat.name}" data-color="${cat.color}" data-sex="${cat.sex}"
                data-age="${cat.age}" data-vacinado="${cat.vacinado}" data-castrado="${cat.castrado}"
                data-donor-type="${donorType}">
                <div class="cat-card__img-wrap">
                  <img src="${cat.img}" alt="${cat.imgAlt}" loading="lazy" />
                  ${badges ? `<div class="cat-card__badges">${badges}</div>` : ''}
                </div>
                <div class="cat-card__body">
                  <h2 class="cat-card__name">${cat.name}</h2>
                  <div class="cat-card__meta">
                    <span class="cat-card__meta-item">${colorLabel}</span>
                    <span class="cat-card__meta-item">${sexLabel}</span>
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

function renderCats(list) {
  const grid = document.querySelector('.cats-grid');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = `<p class="cats-empty">Nenhum gatinho encontrado com os filtros selecionados.</p>`;
  } else {
    grid.innerHTML = list.map((cat) => catCardHTML(cat, CATS.indexOf(cat))).join('');
  }
}

function updateCount(n) {
  const el = document.querySelector('.cats-count');
  if (!el) return;
  el.innerHTML = `<strong>${n}</strong> ${n === 1 ? 'gatinho encontrado' : 'gatinhos encontrados'}`;
}

function applyFilters() {
  const cor      = document.getElementById('cor-filter')?.value ?? '';
  const sexo     = document.getElementById('sexo-filter')?.value ?? '';
  const idade    = document.getElementById('idade-filter')?.value ?? '';
  const doador   = document.getElementById('doador-filter')?.value ?? '';
  const vacCheck = document.getElementById('filtro-vacinado')?.checked ?? false;
  const neuCheck = document.getElementById('filtro-castrado')?.checked ?? false;

  const result = CATS.filter(cat => {
    if (cor    && cat.color !== cor)  return false;
    if (sexo   && cat.sex   !== sexo) return false;
    if (idade  && cat.age   !== idade) return false;
    if (doador && (cat.donorType ?? 'resgate-informal') !== doador) return false;
    if (vacCheck && !cat.vacinado)   return false;
    if (neuCheck && !cat.castrado)   return false;
    return true;
  });

  renderCats(result);
  updateCount(result.length);
}

function resetFilters() {
  ['cor-filter','sexo-filter','idade-filter','doador-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['filtro-vacinado','filtro-castrado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  applyFilters();
}

/* ── Modal ──────────────────────────────────────────────────── */
function openModal(cat) {
  const modal   = document.getElementById('cat-modal');
  if (!modal) return;

  const waMsg = encodeURIComponent(`Olá! Tenho interesse em adotar ${cat.sex === 'femea' ? 'a' : 'o'} ${cat.name}.`);
  const waUrl = `https://wa.me/${cat.whatsapp}?text=${waMsg}`;

  const vacBadge = cat.vacinado
    ? `<span class="badge badge-vac">${cat.sex === 'femea' ? 'Vacinada' : 'Vacinado'}</span>` : '';
  const neuBadge = cat.castrado
    ? `<span class="badge badge-neu">${cat.sex === 'femea' ? 'Castrada' : 'Castrado'}</span>` : '';

  const colorLabel = {
    solido: 'Sólido', tigrado: 'Tigrado', bicolor: 'Bicolor',
    tricolor: 'Tricolor / Calico', tartaruga: 'Tartaruga', colorpoint: 'Colorpoint',
  }[cat.color] ?? cat.color;

  modal.querySelector('.modal__img').src     = cat.img;
  modal.querySelector('.modal__img').alt     = cat.imgAlt;
  modal.querySelector('.modal__name').textContent   = cat.name;
  modal.querySelector('.modal__badges').innerHTML   = vacBadge + neuBadge;
  modal.querySelector('.modal__description').textContent = cat.description ?? '';

  modal.querySelector('.modal__info-table').innerHTML = `
    <tr><th>Idade</th><td>${cat.ageLabel}</td></tr>
    <tr><th>Sexo</th><td>${cat.sex === 'femea' ? 'Fêmea' : 'Macho'}</td></tr>
    <tr><th>Pelagem</th><td>${colorLabel}</td></tr>
    <tr><th>Cidade</th><td>${cat.city}</td></tr>
    <tr><th>Vacinado</th><td>${cat.vacinado ? 'Sim' : 'Não'}</td></tr>
    <tr><th>Castrado</th><td>${cat.castrado ? 'Sim' : 'Não'}</td></tr>
    <tr><th>Contato</th><td>${cat.contact ?? '—'}</td></tr>
  `;

  // ONG vs WhatsApp contact button
  const isOng    = cat.donorType === 'ong';
  const adoptBtn = modal.querySelector('.modal__adopt-btn');
  const ongBtn   = modal.querySelector('.modal__ong-btn');
  if (adoptBtn) { adoptBtn.hidden = isOng; if (!isOng) adoptBtn.href = waUrl; }
  if (ongBtn)   { ongBtn.hidden = !isOng; if (isOng && cat.ongUrl) ongBtn.href = cat.ongUrl; }

  // Docs section — populate chips and show/hide toggle button
  const docsEl  = document.getElementById('modal-docs');
  const docsBtn = document.getElementById('modal-docs-btn');
  const docChips = [];
  if (!isOng && cat.vacinado)    docChips.push('<span class="modal__doc-chip">Caderneta de Vacinação</span>');
  if (!isOng && cat.castrado)    docChips.push('<span class="modal__doc-chip">Atestado de Castração</span>');
  if (!isOng && cat.docProtetor) docChips.push('<span class="modal__doc-chip">Comprovante de Protetor Registrado</span>');
  if (docsEl) {
    if (docChips.length) {
      docsEl.innerHTML = `<p class="modal__docs-title">Documentação disponível</p><div class="modal__docs-chips">${docChips.join('')}</div><p class="modal__docs-hint">Solicite os documentos ao doador antes do encontro presencial.</p>`;
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
  modal.querySelector('.modal__close').focus();
}

function closeModal() {
  const modal = document.getElementById('cat-modal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

export function init() {
  renderCats(CATS);
  updateCount(CATS.length);

  const inputs = ['cor-filter','sexo-filter','idade-filter','doador-filter','filtro-vacinado','filtro-castrado'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input',  applyFilters);
    el?.addEventListener('change', applyFilters);
  });

  document.querySelector('.filters-panel__reset')?.addEventListener('click', resetFilters);

  // Modal delegation
  document.querySelector('.cats-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('.cat-card__details-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.catIndex, 10);
    if (!isNaN(idx) && CATS[idx]) openModal(CATS[idx]);
  });

  const modal = document.getElementById('cat-modal');
  if (modal) {
    modal.querySelector('.modal__close')?.addEventListener('click', closeModal);
    modal.querySelector('.modal__overlay')?.addEventListener('click', closeModal);

    // Docs section toggle
    modal.querySelector('#modal-docs-btn')?.addEventListener('click', () => {
      const docsEl = document.getElementById('modal-docs');
      const btn    = document.getElementById('modal-docs-btn');
      if (!docsEl || !btn) return;
      docsEl.hidden = !docsEl.hidden;
      btn.setAttribute('aria-expanded', String(!docsEl.hidden));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) closeModal();
    });
  }
}

// Backward compat: also wire up if loaded standalone (without app.js)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // Already ready (shouldn't happen via dynamic import from DOMContentLoaded, but just in case)
  init();
}
