/**
 * app.js — LoveCats main entry point (ES module)
 * Imported via <script type="module"> on every page.
 */

import { initTheme }       from './modules/theme.js';
import { initNav }         from './modules/nav.js';
import { initAnimations, initCounters } from './modules/animations.js';
import { initFilters }     from './modules/filters.js';
import { initImageUpload } from './modules/imageUpload.js';

document.addEventListener('DOMContentLoaded', () => {
  // ── Global (every page) ────────────────────────────────────
  initTheme();
  initNav();
  initAnimations();

  // ── Page-specific ──────────────────────────────────────────
  const body = document.body;

  if (body.dataset.page === 'home') {
    initCounters();
  }

  if (body.dataset.page === 'adopt') {
    initFilters();
  }

  if (body.dataset.page === 'announce') {
    initImageUpload();
    initAnnounceForm();
  }
});

/** Basic announce form handler — shows success state on submit */
function initAnnounceForm() {
  const form = document.querySelector('.form-announce');
  const success = document.querySelector('.form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather files (available via getUploadedFiles() from imageUpload module)
    // In a real app you'd POST a FormData here.
    // For now we simply show the success message.
    form.style.display = 'none';
    success?.classList.add('is-visible');
    success?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
