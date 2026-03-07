/**
 * theme.js — Dark/Light mode toggle
 * Reads localStorage, defaults to dark, applies data-theme to <html>.
 */

const STORAGE_KEY = 'lc-theme';
const DARK = 'dark';
const LIGHT = 'light';

export function initTheme() {
  const root = document.documentElement;
  const stored = localStorage.getItem(STORAGE_KEY);
  const preferred = stored ?? DARK;

  applyTheme(preferred, root);

  // Wire up every .btn-theme button (header + mobile drawer)
  document.querySelectorAll('.btn-theme').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === DARK ? LIGHT : DARK;
      applyTheme(next, root);
      localStorage.setItem(STORAGE_KEY, next);
    });
  });
}

function applyTheme(theme, root) {
  root.dataset.theme = theme;
  document.querySelectorAll('.btn-theme').forEach((btn) => {
    btn.setAttribute('aria-label', theme === DARK ? 'Ativar modo claro' : 'Ativar modo escuro');
    btn.setAttribute('aria-pressed', theme === LIGHT ? 'true' : 'false');
  });
}
