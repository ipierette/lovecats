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
 * Must be called AFTER live values are available (e.g. after the API fetch).
 * Accepts optional live values to override the static data-count attributes.
 * Elements already in the viewport animate immediately; others wait for scroll.
 *
 * @param {{ adotados?: number, disponiveis?: number, mes?: number }} [live]
 */
export function initCounters(live = {}) {
  const overrides = [
    { id: 'metric-adotados',    value: live.adotados    },
    { id: 'metric-disponiveis', value: live.disponiveis },
    { id: 'metric-mes',         value: live.mes         },
  ];
  overrides.forEach(({ id, value }) => {
    if (value == null) return;
    const el = document.getElementById(id);
    if (el) el.dataset.count = value;
  });

  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const { top, bottom } = el.getBoundingClientRect();
    const inView = top < window.innerHeight && bottom > 0;
    if (inView) {
      animateCount(el);
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.15 });
      io.observe(el);
    }
  });
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix ?? '';
  const duration = 800;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out expo — fast start, soft landing
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
