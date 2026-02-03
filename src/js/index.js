document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("has-js");

  const animated = Array.from(document.querySelectorAll("[data-animate]"));
  const buttons = document.querySelectorAll(".btn, .theme-toggle");
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const highlightNav = document.querySelectorAll("#highlight-nav a");

  function setHighlightNav() {
    const currentPage = window.location.pathname;

    highlightNav.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.remove("active");

      if (
        href === currentPage ||
        currentPage.includes(href.replace("./", ""))
      ) {
        link.classList.add("active");
      }
    });
  }

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

  // Chama as rotinas de animação e destaque a cada rolagem/redimensionamento.
  function handleScroll() {
    revealOnScroll();
    setHighlightNav();
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
