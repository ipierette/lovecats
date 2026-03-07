/**
 * filters.js — Cat card live filtering for adote-um-gatinho.html
 */

export function initFilters() {
  const grid = document.querySelector('.cats-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.cat-card'));
  const countEl = document.querySelector('.cats-count strong');

  const inputs = {
    busca: document.querySelector('#buscar'),
    cor: document.querySelector('#cor-filter'),
    sexo: document.querySelector('#sexo-filter'),
    idade: document.querySelector('#idade-filter'),
    vacinado: document.querySelector('#filtro-vacinado'),
    castrado: document.querySelector('#filtro-castrado'),
  };

  const resetBtn = document.querySelector('.filters-panel__reset');

  function normalize(str) {
    return (str ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function filterCards() {
    const busca = normalize(inputs.busca?.value ?? '');
    const cor = normalize(inputs.cor?.value ?? '');
    const sexo = normalize(inputs.sexo?.value ?? '');
    const idade = normalize(inputs.idade?.value ?? '');
    const vacinado = inputs.vacinado?.checked;
    const castrado = inputs.castrado?.checked;

    let visible = 0;

    cards.forEach((card) => {
      const name = normalize(card.dataset.name ?? '');
      const cardCor = normalize(card.dataset.color ?? '');
      const cardSexo = normalize(card.dataset.sex ?? '');
      const cardIdade = normalize(card.dataset.age ?? '');
      const cardVac = card.dataset.vacinado === 'true';
      const cardCas = card.dataset.castrado === 'true';

      const match =
        (!busca || name.includes(busca) || cardCor.includes(busca)) &&
        (!cor || cardCor === cor) &&
        (!sexo || cardSexo === sexo) &&
        (!idade || cardIdade === idade) &&
        (!vacinado || cardVac) &&
        (!castrado || cardCas);

      card.hidden = !match;
      if (match) visible++;
    });

    // Update counter
    if (countEl) countEl.textContent = visible;

    // Show / hide empty state
    let empty = grid.querySelector('.empty-state');
    if (!visible) {
      if (!empty) {
        empty = buildEmptyState();
        grid.appendChild(empty);
      }
      empty.hidden = false;
    } else if (empty) {
      empty.hidden = true;
    }
  }

  function buildEmptyState() {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="28" r="16"/>
        <path d="M22 20c0-5.5 4-10 10-10s10 4.5 10 10"/>
        <path d="M20 54c0-6.6 5.4-12 12-12s12 5.4 12 12"/>
      </svg>
      <p class="empty-state__title">Nenhum gatinho encontrado</p>
      <p>Tente ajustar os filtros.</p>`;
    return div;
  }

  // Attach event listeners
  Object.values(inputs).forEach((el) => {
    if (!el) return;
    const event = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(event, filterCards);
  });

  resetBtn?.addEventListener('click', () => {
    Object.values(inputs).forEach((el) => {
      if (!el) return;
      if (el.type === 'checkbox') el.checked = false;
      else el.value = '';
    });
    filterCards();
  });

  // Initial count render
  const total = cards.length;
  if (countEl) countEl.textContent = total;
}
