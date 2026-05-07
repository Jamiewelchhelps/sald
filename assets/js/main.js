document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(links.classList.contains("open")));
    });
  }

  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      if (status) {
        status.textContent = "Thanks — we'll be in touch.";
        status.style.color = "var(--accent)";
      }
      form.reset();
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
