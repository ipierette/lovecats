document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".info-team");
  const cards = document.querySelectorAll(".card-team");
  const prevBtn = document.querySelector(".arrow:not(.next)");
  const nextBtn = document.querySelector(".arrow.next");

  // 1. Define quantos cards saltar por clique
  function getScrollStep() {
    const width = window.innerWidth;
    if (width <= 768) {
      return 1; // No mobile, pula de 1 em 1
    } else if (width <= 1024) {
      return 2; // No tablet, pula de 2 em 2
    } else {
      return 3; // No desktop, pula o bloco de 3
    }
  }

  function moveSlider(direction) {
    // Pegamos a largura real do card + o gap de 30px definido no CSS
    const cardFullWidth = cards[0].offsetWidth + 30; 
    const step = getScrollStep();
    const scrollAmount = cardFullWidth * step;

    if (direction === "next") {
      // Verifica se chegou ao fim (com margem de erro de 10px)
      const isEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10;
      
      if (isEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      // Verifica se está no início
      if (container.scrollLeft <= 5) {
        container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  }

  nextBtn.addEventListener("click", () => moveSlider("next"));
  prevBtn.addEventListener("click", () => moveSlider("prev"));
});