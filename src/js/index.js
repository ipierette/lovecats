document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("has-js");

  const animated = Array.from(document.querySelectorAll("[data-animate]"));
  const buttons = document.querySelectorAll(".btn, .theme-toggle");
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const navItems = navLinks.map((link) => ({
    link,
    target: document.querySelector(link.getAttribute("href")),
  }));

  // Deixa o primeiro link (Home) ativo ao carregar a página.
  if (navLinks[0]) navLinks[0].classList.add("is-active");

  // Mostra os elementos marcados com data-animate quando entram na área visível.
  function revealOnScroll() {
    animated.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.85;
      if (rect.top <= triggerPoint) {
        el.classList.add("is-visible");
      }
    });
  }

  // Mantém o link do menu ativo de acordo com a seção visível na tela.
  function highlightNav() {
    const tracked = navItems.filter((item) => item.target);
    if (tracked.length <= 1) return; // evita sobrescrever clique quando só há uma seção

    const marker = window.innerHeight * 0.3;
    tracked.forEach(({ link, target }) => {
      const rect = target.getBoundingClientRect();
      const isVisible = rect.top <= marker && rect.bottom >= marker;
      link.classList.toggle("is-active", isVisible);
    });
  }

  // Chama as rotinas de animação e destaque a cada rolagem/redimensionamento.
  function handleScroll() {
    revealOnScroll();
    highlightNav();
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleScroll);
  handleScroll();

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.remove("is-pressed");
      btn.offsetWidth; // reinicia a animação de clique
      btn.classList.add("is-pressed");
      setTimeout(() => btn.classList.remove("is-pressed"), 240);
    });
  });
});

