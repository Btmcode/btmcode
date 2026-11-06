(() => {
  "use strict";

  const menu = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("#primary-navigation");
  const menuIcon = menu && menu.querySelector("[data-menu-icon]");
  const menuSrText = menu && menu.querySelector(".sr-only");

  function closeMenu() {
    if (!menu || !nav) return;
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", (window.BTM_UI_TEXT || {}).openMenu || "Open menu");
    if (menuIcon) menuIcon.textContent = "☰";
    if (menuSrText) menuSrText.textContent = (window.BTM_UI_TEXT || {}).openMenu || "Open menu";
  }
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? ((window.BTM_UI_TEXT || {}).closeMenu || "Close menu") : ((window.BTM_UI_TEXT || {}).openMenu || "Open menu"));
      if (menuIcon) menuIcon.textContent = open ? "×" : "☰";
      if (menuSrText) menuSrText.textContent = open ? ((window.BTM_UI_TEXT || {}).closeMenu || "Close menu") : ((window.BTM_UI_TEXT || {}).openMenu || "Open menu");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeMenu();
        menu.focus();
      }
    });
    document.addEventListener("click", event => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 741px)").matches) closeMenu();
    });
  }

  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    root.dataset.theme = next;
    root.style.colorScheme = next;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = next === "light" ? "#f4f6f1" : "#0a0f0e";
    try { localStorage.setItem("btm-theme", next); } catch (error) {}
    if (themeToggle) {
      const isLight = next === "light";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      const labels = window.BTM_UI_TEXT || {};
      themeToggle.setAttribute("aria-label", isLight ? (labels.darkTheme || "Switch to dark theme") : (labels.lightTheme || "Switch to light theme"));
      const icon = themeToggle.querySelector("[data-theme-icon]");
      if (icon) icon.textContent = isLight ? "☀" : "☾";
    }
  }
  if (themeToggle) {
    applyTheme(root.dataset.theme || "dark");
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "light" ? "dark" : "light");
    });
  } else {
    root.style.colorScheme = root.dataset.theme === "light" ? "light" : "dark";
  }

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.11});
    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
  }

  document.querySelectorAll(".faq-item button").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
      const icon = button.querySelector("[data-plus]");
      if (icon) icon.textContent = open ? "−" : "+";
    });
  });

  document.querySelectorAll("[data-year]").forEach(element => {
    element.textContent = String(new Date().getFullYear());
  });

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const projectCards = Array.from(document.querySelectorAll("[data-category]"));
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      projectCards.forEach(card => {
        card.hidden = filter !== "all" && !String(card.dataset.category || "").split(" ").includes(filter);
      });
    });
  });

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const formData = new FormData(form);
      if (String(formData.get("website") || "").trim()) {
        if (status) status.textContent = (window.BTM_MESSAGES || {}).success || "Thank you.";
        form.reset();
        return;
      }

      const messages = window.BTM_MESSAGES || {};
      const originalButtonText = submitButton ? submitButton.textContent : "";
      const payload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        company: String(formData.get("company") || "").trim(),
        service: String(formData.get("service") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        website: String(formData.get("website") || "").trim()
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        submitButton.textContent = messages.sending || "Sending…";
      }
      if (status) status.textContent = "";

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {"Content-Type":"application/json", "Accept":"application/json"},
          body: JSON.stringify(payload),
          credentials: "same-origin"
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          if (status) status.textContent = response.status === 503 ? (messages.unavailable || messages.error) : (messages.error || "Could not send the message.");
          return;
        }
        form.reset();
        if (status) status.textContent = messages.success || "Your message has been sent.";
      } catch (error) {
        if (status) status.textContent = messages.error || "Could not send the message. Please try again.";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }
})();