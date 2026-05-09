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
 * Call immediately on page load; live values from the API are applied afterwards
 * via direct textContent update in app.js.
 */
export function initCounters() {
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
    { threshold: 0.15 }
  );

  counters.forEach((el) => io.observe(el));
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
