document.addEventListener("DOMContentLoaded", function () {
  const dropdownButton = document.getElementById("sex-dropdown");
  const dropdownMenu = document.getElementById("sex-menu");
  const dropdownText = dropdownButton.querySelector(".dropdown-text");
  const hiddenInput = document.getElementById("sex-cat");
  const dropdownItems = dropdownMenu.querySelectorAll(".dropdown-item");

  dropdownButton.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropdownButton.classList.toggle("active");
    dropdownMenu.classList.toggle("show");
  });

  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();

      dropdownItems.forEach((i) => i.classList.remove("active"));

      this.classList.add("active");

      dropdownText.textContent = this.querySelector("span").textContent;

      hiddenInput.value = this.dataset.value;

      dropdownButton.classList.remove("active");
      dropdownMenu.classList.remove("show");
    });
  });

  document.addEventListener("click", function (e) {
    if (
      !dropdownButton.contains(e.target) &&
      !dropdownMenu.contains(e.target)
    ) {
      dropdownButton.classList.remove("active");
      dropdownMenu.classList.remove("show");
    }
  });
});
