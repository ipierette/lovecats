document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".info-team");
  const cards = document.querySelectorAll(".card-team");
  const prevBtn = document.querySelector(".arrow:not(.next)");
  const nextBtn = document.querySelector(".arrow.next");

  const cardsPerView = 3;
  const cardWidth = cards[0].offsetWidth + 30; // largura + gap
  const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;

  let currentIndex = 0;

  //console.log(cardWidth);

  function updateSlider() {
    const scrollAmount = currentIndex * cardWidth * cardsPerView;
    container.scrollTo({
      left: scrollAmount,
      behavior: "smooth"
    });
  }

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0; // volta para o início
    }
    updateSlider();
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = maxIndex; // vai para o final
    }
    updateSlider();
  });
});
