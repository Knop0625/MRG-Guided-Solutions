const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-site-nav] a").forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav?.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = [data.get("firstName"), data.get("lastName")].filter(Boolean).join(" ");
    const email = data.get("email") || "";
    const phone = data.get("phone") || "";
    const company = data.get("company") || "";
    const industry = data.get("industry") || "";
    const message = data.get("message") || "";
    const subject = encodeURIComponent(`Business Review Request from ${company || name || "MRG Website"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Company: ${company}`,
        `Industry: ${industry}`,
        "",
        "Operational challenge:",
        message
      ].join("\n")
    );
    const to = form.getAttribute("data-contact-email");
    const status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = "Thanks. Your email app should open with the request ready to send.";
    }
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  });
});
