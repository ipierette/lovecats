document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const codeBlocks = document.querySelectorAll(".code-block");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetLang = button.getAttribute("data-lang");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      codeBlocks.forEach((block) => {
        block.classList.remove("active");
      });

      const targetBlock = document.querySelector(`.code-block.${targetLang}`);
      if (targetBlock) {
        targetBlock.classList.add("active");
      }
    });
  });
});
