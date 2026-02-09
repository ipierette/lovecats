document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
  const button = dropdown.querySelector(".dropdown-button");
  const menu = dropdown.querySelector(".dropdown-menu");
  const selected = dropdown.querySelector(".dropdown-selected");
  const items = dropdown.querySelectorAll(".dropdown-item");

  if (items.length > 0) {
    items[0].classList.add("active");
    const firstText =
      items[0].querySelector("span")?.textContent ||
      items[0].textContent.trim();
    selected.textContent = firstText;
  }

  button.addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelectorAll(".custom-dropdown").forEach((other) => {
      if (other !== dropdown) {
        other.querySelector(".dropdown-menu").classList.remove("show");
        other.querySelector(".dropdown-button").classList.remove("active");
      }
    });

    button.classList.toggle("active");
    menu.classList.toggle("show");
  });

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const span = item.querySelector("span");
      if (span) {
        selected.textContent = span.textContent;
      } else {
        selected.textContent = item.textContent.trim();
      }

      menu.classList.remove("show");
      button.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      menu.classList.remove("show");
      button.classList.remove("active");
    }
  });
});
