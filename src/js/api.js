document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const blocks = document.querySelectorAll(".code-block");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetLang = tab.getAttribute("data-lang");

      tabs.forEach((btn) => btn.classList.remove("active"));
      blocks.forEach((block) => block.classList.remove("active"));

      tab.classList.add("active");

      const targetBlock = document.querySelector(`.code-block.${targetLang}`);
      if (targetBlock) {
        targetBlock.classList.add("active");
      }
    });
  });
});
