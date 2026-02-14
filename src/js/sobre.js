document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".info-team");
  const prevBtn = document.querySelector(".arrow:not(.next)");
  const nextBtn = document.querySelector(".arrow.next");
  let isTransitioning = false;

  const originalCards = Array.from(container.children).map((card) =>
    card.cloneNode(true),
  );
  const totalCards = originalCards.length;

  function init() {
    container.innerHTML = "";

    for (let i = 0; i < 5; i++) {
      originalCards.forEach((card) =>
        container.appendChild(card.cloneNode(true)),
      );
    }

    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const cardWidth = container.children[0].offsetWidth + gap;

    container.scrollLeft = totalCards * 2 * cardWidth;
  }

  function checkBuffer() {
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const cardWidth = container.children[0].offsetWidth + gap;
    const { scrollLeft, scrollWidth, offsetWidth } = container;

    if (scrollLeft + offsetWidth > scrollWidth - totalCards * cardWidth * 1.5) {
      originalCards.forEach((card) =>
        container.appendChild(card.cloneNode(true)),
      );
    }

    if (scrollLeft < totalCards * cardWidth * 1.5) {
      const currentScroll = scrollLeft;
      originalCards.forEach((card) =>
        container.insertBefore(card.cloneNode(true), container.firstChild),
      );
      container.scrollLeft = currentScroll + totalCards * cardWidth;
    }
  }

  function move(direction) {
    if (isTransitioning) return;
    isTransitioning = true;
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const cardWidth = container.children[0].offsetWidth + gap;
    container.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    setTimeout(() => {
      checkBuffer();
      isTransitioning = false;
    }, 300);
  }

  nextBtn.addEventListener("click", () => move(1));
  prevBtn.addEventListener("click", () => move(-1));

  window.addEventListener("resize", () => {
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const cardWidth = container.children[0].offsetWidth + gap;
    const currentPosition = container.scrollLeft;
    const currentIndex = Math.round(currentPosition / cardWidth);
    container.scrollLeft = currentIndex * cardWidth;
  });
  init();
});
