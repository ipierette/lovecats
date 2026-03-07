/**
 * nav.js — Header: hamburger, mobile drawer, active link, scroll state
 */

export function initNav() {
  const header = document.querySelector('.site-header');
  const drawer = document.querySelector('.mobile-drawer');
  const btnMenu = document.querySelector('.btn-menu');
  const btnClose = document.querySelector('.btn-drawer-close');
  const drawerLinks = drawer?.querySelectorAll('.site-nav__link');

  // ── Hamburger / Drawer ──────────────────────────────────────
  function openDrawer() {
    drawer?.classList.add('is-open');
    btnMenu?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('is-open');
    btnMenu?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btnMenu?.addEventListener('click', openDrawer);
  btnClose?.addEventListener('click', closeDrawer);
  drawerLinks?.forEach((link) => link.addEventListener('click', closeDrawer));

  // Close on backdrop click
  drawer?.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  // ── Active link detection ───────────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('is-active');
    }
  });

  // ── Scroll header state ─────────────────────────────────────
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
