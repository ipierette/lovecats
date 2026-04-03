/**
 * animations.js — Scroll-reveal (IntersectionObserver) + animated counters
 */

export function initAnimations() {
  // Signal that JS is available (enables CSS transitions)
  document.documentElement.classList.add('has-js');

  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay ?? '0';
        el.style.setProperty('--reveal-delay', `${delay}ms`);
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => io.observe(el));
}

/**
 * initCounters — animates [data-count] elements from 0 to their target value.
 * If live values are passed (e.g. fetched from Supabase), they override the
 * static data-count attributes before the animation starts.
 *
 * @param {{ adotados?: number, disponiveis?: number, mes?: number }} [live]
 */
export function initCounters(live = {}) {
  // Override static data-count values with live DB data when available
  const overrides = [
    { id: 'metric-adotados',   value: live.adotados    },
    { id: 'metric-disponiveis', value: live.disponiveis },
    { id: 'metric-mes',        value: live.mes         },
  ];
  overrides.forEach(({ id, value }) => {
    if (value == null) return;
    const el = document.getElementById(id);
    if (el) { el.dataset.count = value; el.textContent = value; }
  });

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => io.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix ?? '';
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
