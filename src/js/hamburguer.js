const menuHamburguer = document.querySelector(".menu-hamburguer");
const navMobile = document.querySelector(".nav-mobile");
const overlay = document.querySelector(".menu-overlay");
const header = document.querySelector("header");
const body = document.body;

if (menuHamburguer && navMobile && overlay && header) {
  function toggleMenu() {
    const isOpen = menuHamburguer.classList.contains("active");

    menuHamburguer.classList.toggle("active");
    navMobile.classList.toggle("active");
    overlay.classList.toggle("active");
    body.classList.toggle("menu-open");

    menuHamburguer.setAttribute("aria-expanded", !isOpen);
  }

  function fecharMenu() {
    menuHamburguer.classList.remove("active");
    navMobile.classList.remove("active");
    overlay.classList.remove("active");
    body.classList.remove("menu-open");
    menuHamburguer.setAttribute("aria-expanded", "false");
  }

  menuHamburguer.addEventListener("click", toggleMenu);

  overlay.addEventListener("click", fecharMenu);

  navMobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuHamburguer.classList.contains("active")) {
      fecharMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      fecharMenu();
    }
  });
}
