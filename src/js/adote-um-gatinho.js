/* ============================================================
   LoveCats — Adote um Gatinho
   Mock data + dynamic card rendering + live filters
   ============================================================ */

const CATS = [
  {
    name: 'Mel',
    color: 'laranja',
    sex: 'femea',
    age: 'filhote',
    ageLabel: '3 meses',
    vacinado: true,
    castrado: false,
    city: 'Sao Paulo, SP',
    img: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Mel — gatinha laranja de 3 meses',
    whatsapp: '5511999999991',
  },
  {
    name: 'Shadow',
    color: 'preto',
    sex: 'macho',
    age: 'jovem',
    ageLabel: '1 ano',
    vacinado: true,
    castrado: true,
    city: 'Rio de Janeiro, RJ',
    img: 'https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Shadow — gato preto de 1 ano',
    whatsapp: '5521999999992',
  },
  {
    name: 'Nuvem',
    color: 'branco',
    sex: 'femea',
    age: 'filhote',
    ageLabel: '2 meses',
    vacinado: false,
    castrado: false,
    city: 'Belo Horizonte, MG',
    img: 'https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Nuvem — gatinha branca de 2 meses',
    whatsapp: '5531999999993',
  },
  {
    name: 'Tigre',
    color: 'tigre',
    sex: 'macho',
    age: 'filhote',
    ageLabel: '6 meses',
    vacinado: true,
    castrado: false,
    city: 'Sao Paulo, SP',
    img: 'https://images.pexels.com/photos/45170/kittens-cat-cat-puppy-adorable-45170.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Tigre — gato tigrado de 6 meses',
    whatsapp: '5511999999994',
  },
  {
    name: 'Luna',
    color: 'cinza',
    sex: 'femea',
    age: 'adulto',
    ageLabel: '2 anos',
    vacinado: true,
    castrado: true,
    city: 'Sao Paulo, SP',
    img: 'https://images.pexels.com/photos/1643457/pexels-photo-1643457.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Luna — gatinha cinza de 2 anos',
    whatsapp: '5511999999995',
  },
  {
    name: 'Caramelo',
    color: 'laranja',
    sex: 'macho',
    age: 'filhote',
    ageLabel: '4 meses',
    vacinado: true,
    castrado: false,
    city: 'Sao Paulo, SP',
    img: 'https://images.pexels.com/photos/2181171/pexels-photo-2181171.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Caramelo — gato laranja de 4 meses',
    whatsapp: '5511999999996',
  },
  {
    name: 'Mia',
    color: 'malhado',
    sex: 'femea',
    age: 'filhote',
    ageLabel: '5 meses',
    vacinado: false,
    castrado: false,
    city: 'Salvador, BA',
    img: 'https://images.pexels.com/photos/34026607/pexels-photo-34026607.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Mia — gatinha malhada de 5 meses',
    whatsapp: '5571999999997',
  },
  {
    name: 'Thor',
    color: 'laranja',
    sex: 'macho',
    age: 'adulto',
    ageLabel: '3 anos',
    vacinado: true,
    castrado: true,
    city: 'Fortaleza, CE',
    img: 'https://images.pexels.com/photos/33337218/pexels-photo-33337218.jpeg?auto=compress&cs=tinysrgb&w=400',
    imgAlt: 'Thor — gato laranja de 3 anos',
    whatsapp: '5585999999998',
  },
];

const PIN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

function catCardHTML(cat) {
  const waMsg = encodeURIComponent(`Ola! Tenho interesse em adotar ${cat.sex === 'femea' ? 'a' : 'o'} ${cat.name}.`);
  const waUrl = `https://wa.me/${cat.whatsapp}?text=${waMsg}`;
  const pronoun = cat.sex === 'femea' ? 'a' : 'o';
  const vacLabel = cat.sex === 'femea' ? 'Vacinada' : 'Vacinado';
  const neuLabel = cat.sex === 'femea' ? 'Castrada' : 'Castrado';

  const badges = [
    cat.vacinado ? `<span class="badge badge-vac">${vacLabel}</span>` : '',
    cat.castrado ? `<span class="badge badge-neu">${neuLabel}</span>` : '',
  ].filter(Boolean).join('\n                    ');

  const colorLabel = {
    laranja: 'Laranja', preto: 'Preto', branco: 'Branco',
    tigre: 'Tigrado', cinza: 'Cinza', malhado: 'Malhado',
  }[cat.color] ?? cat.color;

  const sexLabel = cat.sex === 'femea' ? 'Femea' : 'Macho';

  return `
              <article class="cat-card" role="listitem"
                data-name="${cat.name}" data-color="${cat.color}" data-sex="${cat.sex}"
                data-age="${cat.age}" data-vacinado="${cat.vacinado}" data-castrado="${cat.castrado}">
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
                  <div class="btn-contact">
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
                       class="btn btn-primary" style="width:100%;justify-content:center;">
                      Adotar ${cat.name}
                    </a>
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
    grid.innerHTML = list.map(catCardHTML).join('');
  }
}

function updateCount(n) {
  const el = document.querySelector('.cats-count');
  if (!el) return;
  el.innerHTML = `<strong>${n}</strong> ${n === 1 ? 'gatinho encontrado' : 'gatinhos encontrados'}`;
}

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function applyFilters() {
  const q        = normalize(document.getElementById('buscar')?.value ?? '');
  const cor      = document.getElementById('cor-filter')?.value ?? '';
  const sexo     = document.getElementById('sexo-filter')?.value ?? '';
  const idade    = document.getElementById('idade-filter')?.value ?? '';
  const vacCheck = document.getElementById('filtro-vacinado')?.checked ?? false;
  const neuCheck = document.getElementById('filtro-castrado')?.checked ?? false;

  const result = CATS.filter(cat => {
    if (q && !normalize(cat.name + ' ' + cat.city).includes(q)) return false;
    if (cor   && cat.color !== cor)  return false;
    if (sexo  && cat.sex   !== sexo) return false;
    if (idade && cat.age   !== idade) return false;
    if (vacCheck && !cat.vacinado)   return false;
    if (neuCheck && !cat.castrado)   return false;
    return true;
  });

  renderCats(result);
  updateCount(result.length);
}

function resetFilters() {
  ['buscar','cor-filter','sexo-filter','idade-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['filtro-vacinado','filtro-castrado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  applyFilters();
}

export function init() {
  renderCats(CATS);
  updateCount(CATS.length);

  const inputs = ['buscar','cor-filter','sexo-filter','idade-filter','filtro-vacinado','filtro-castrado'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input',  applyFilters);
    el?.addEventListener('change', applyFilters);
  });

  document.querySelector('.filters-panel__reset')?.addEventListener('click', resetFilters);
}

// Backward compat: also wire up if loaded standalone (without app.js)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // Already ready (shouldn't happen via dynamic import from DOMContentLoaded, but just in case)
  init();
}
