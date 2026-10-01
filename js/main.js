(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const header = $("[data-header]");
  const nav = $("[data-nav]");
  const toggle = $("[data-nav-toggle]");
  const preloader = $("[data-preloader]");
  const modal = $("[data-modal]");
  const modalFrame = $("[data-modal-frame]");
  const modalClose = $("[data-modal-close]");
  const toast = $("[data-toast]");
  const form = $("[data-booking-form]");
  const year = $("[data-year]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const COOKIE_CONSENT_KEY = "aw-cookie-consent";
  const cookieBanner = $("[data-cookie-banner]");
  const cookieAccept = $("[data-cookie-accept]");
  const cookieReject = $("[data-cookie-reject]");

  const hideCookieBanner = () => {
    cookieBanner?.setAttribute("hidden", "");
  };

  const saveCookieChoice = (value) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      /* storage blocked */
    }
    hideCookieBanner();
  };

  if (cookieBanner) {
    let hasConsent = false;
    try {
      hasConsent = Boolean(localStorage.getItem(COOKIE_CONSENT_KEY));
    } catch {
      hasConsent = false;
    }
    if (!hasConsent) {
      cookieBanner.removeAttribute("hidden");
    }
  }

  cookieAccept?.addEventListener("click", () => saveCookieChoice("all"));
  cookieReject?.addEventListener("click", () => saveCookieChoice("essential"));

  window.addEventListener("load", () => {
    preloader?.classList.add("is-done");
  });

  if (preloader) {
    window.setTimeout(() => preloader.classList.add("is-done"), 1800);
  }

  const backTop = $("[data-back-top]");

  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
    backTop?.classList.toggle("is-visible", window.scrollY > 360);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const closeNav = () => {
    nav?.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
      closeModal();
    }
  });

  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && revealItems.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item, index) => {
      item.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
      io.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    if (Number.isNaN(target)) {
      return;
    }
    const prefix = el.dataset.prefix ?? "";
    const suffix = el.dataset.suffix ?? "";
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const countIo = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      }
    });
    counters.forEach((el) => countIo.observe(el));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  $$("[data-date]").forEach((eventEl) => {
    const raw = eventEl.getAttribute("data-date");
    if (!raw) {
      return;
    }
    const date = new Date(`${raw}T00:00:00`);
    if (date < today) {
      eventEl.classList.add("is-past");
      const heading = $("h3", eventEl);
      if (heading && !heading.querySelector(".caption")) {
        const flag = document.createElement("span");
        flag.className = "caption";
        flag.textContent = " · realizado";
        heading.append(flag);
      }
    }
  });

  const chips = $$("[data-agenda-filters] [data-filter]");
  const events = $$("[data-agenda] .event");
  const emptyAgenda = $("[data-agenda-empty]");
  const applyStateFilter = (filter) => {
    let visible = 0;
    events.forEach((eventEl) => {
      const state = eventEl.getAttribute("data-state") ?? "";
      const match = filter === "all" || state === filter;
      eventEl.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    if (emptyAgenda) {
      emptyAgenda.hidden = visible > 0;
    }
  };
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      applyStateFilter(chip.dataset.filter ?? "all");
    });
  });

  const venueChips = $$("[data-venue-filters] [data-filter]");
  const venues = $$("[data-venues] .venue");
  const emptyVenues = $("[data-venues-empty]");
  const applyVenueFilter = (filter) => {
    let visible = 0;
    venues.forEach((venueEl) => {
      const state = venueEl.getAttribute("data-state") ?? "";
      const match = filter === "all" || state === filter;
      venueEl.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    if (emptyVenues) {
      emptyVenues.hidden = visible > 0;
    }
  };
  venueChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      venueChips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      applyVenueFilter(chip.dataset.filter ?? "all");
    });
  });

  let lastFocus = null;

  const openModal = (id) => {
    if (!modal || !modalFrame) {
      return;
    }
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add("is-open");
    modalFrame.innerHTML = `<iframe title="Set de Ale Wayne no YouTube" src="https://www.youtube.com/embed/${id}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    document.body.style.overflow = "hidden";
    modalClose?.focus();
  };

  const closeModal = () => {
    if (!modal || !modalFrame) {
      return;
    }
    modal.classList.remove("is-open");
    modal.hidden = true;
    modalFrame.replaceChildren();
    document.body.style.overflow = "";
    if (lastFocus instanceof HTMLElement) {
      lastFocus.focus();
    }
  };

  $$("[data-video]").forEach((card) => {
    const play = () => openModal(card.getAttribute("data-video") ?? "");
    card.addEventListener("click", play);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  const showToast = (message) => {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const setError = (input, message) => {
    const field = input.closest(".field");
    const hint = field?.querySelector("small");
    field?.classList.toggle("error", Boolean(message));
    if (hint) {
      hint.textContent = message;
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nome = String(data.get("nome") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const tipo = String(data.get("tipo") ?? "").trim();
    const quando = String(data.get("quando") ?? "").trim();

    const nomeInput = form.elements.namedItem("nome");
    const emailInput = form.elements.namedItem("email");
    const tipoInput = form.elements.namedItem("tipo");

    let valid = true;
    if (nomeInput instanceof HTMLInputElement) {
      const error = nome.length < 2 ? "Informe o nome." : "";
      setError(nomeInput, error);
      valid = valid && !error;
    }
    if (emailInput instanceof HTMLInputElement) {
      const error = emailOk(email) ? "" : "E-mail inválido.";
      setError(emailInput, error);
      valid = valid && !error;
    }
    if (tipoInput instanceof HTMLSelectElement) {
      const error = tipo ? "" : "Escolha o tipo de proposta.";
      setError(tipoInput, error);
      valid = valid && !error;
    }

    if (!valid) {
      showToast("Revise os campos destacados.");
      return;
    }

    const text = [
      `Booking Ale Wayne`,
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `Tipo: ${tipo}`,
      quando ? `Quando/onde: ${quando}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsapp = `https://wa.me/5541999199796?text=${encodeURIComponent(text)}`;
    window.open(whatsapp, "_blank", "noopener,noreferrer");
    showToast("Abrindo WhatsApp oficial da A.W.");
    form.reset();
  });
})();
