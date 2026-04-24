(function () {
  const overlay = document.getElementById("booking-overlay");
  const popup = overlay ? overlay.querySelector(".booking-popup") : null;
  const closeBtn = document.getElementById("booking-close");
  const formState = document.getElementById("booking-form-state");
  const form = document.getElementById("booking-form");
  const successState = document.getElementById("booking-success-state");
  const successCloseBtn = document.getElementById("booking-success-close");
  const successScrollBtn = document.getElementById("booking-success-scroll");
  const selectedTourNameEl = document.getElementById("selected-tour-name");
  const errorMessageEl = document.getElementById("booking-error-message");
  const nameInput = document.getElementById("booking-name");
  const contactInput = document.getElementById("booking-contact");
  const bookButtons = document.querySelectorAll(".card-book-btn");

  if (!overlay || !popup || !formState || !form || !successState || !successCloseBtn || !successScrollBtn || !selectedTourNameEl || !nameInput || !contactInput || !errorMessageEl) {
    return;
  }

  const defaultTourProgramUrl = {
    "Золотое кольцо Абхазии": "pages/zolotoe-koltso-abkhazia.html",
    "Термальный источник Кындыг": "pages/kyndyg-chernigovka.html",
    "Джип-тур Гегский водопад": "pages/dzhip-gegskiy-vodopad.html",
  };
  const TOUR_PROGRAM_URL = Object.assign({}, defaultTourProgramUrl, window.BOOKING_TOUR_PROGRAM_OVERRIDES || {});

  let lastFocusedElement = null;
  let selectedScrollTargetId = "";
  let selectedProgramPageUrl = "";
  let bookingPhoneDigits = "";

  function showFormState() {
    formState.classList.remove("is-hidden");
    successState.classList.remove("is-visible");
  }

  function showSuccessState() {
    formState.classList.add("is-hidden");
    successState.classList.add("is-visible");
    successCloseBtn.focus();
  }

  function openPopup(tourName) {
    const name = tourName || "Экскурсия";
    selectedTourNameEl.textContent = name;
    selectedProgramPageUrl = TOUR_PROGRAM_URL[name] || "";
    errorMessageEl.textContent = "";
    form.reset();
    bookingPhoneDigits = "";
    showFormState();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    lastFocusedElement = document.activeElement;
    requestAnimationFrame(function () {
      contactInput.focus();
    });
  }

  function closePopup() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  bookButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      selectedScrollTargetId = button.getAttribute("data-scroll-target") || "";
      openPopup(button.getAttribute("data-tour-name"));
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closePopup();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closePopup();
    }
  });

  function normalizeRawDigits(only) {
    var d = (only || "").replace(/\D/g, "");
    if (!d) return "";
    if (d[0] === "8") d = "7" + d.slice(1);
    else if (d[0] === "9") d = "7" + d;
    else if (d[0] !== "7") d = "7" + d;
    return d.slice(0, 11);
  }

  function formatPhoneFromDigits7(d) {
    if (!d) return "";
    d = d.slice(0, 11);
    if (d[0] !== "7") {
      d = normalizeRawDigits(d);
    }
    if (!d) return "";
    if (d[0] !== "7") return "";
    if (d.length === 1) {
      return "+7";
    }
    var n = d.slice(1);
    if (n.length === 0) {
      return "+7";
    }
    var s = "+7 (";
    s += n.slice(0, 3);
    if (n.length < 3) {
      return s;
    }
    s += ") " + n.slice(3, 6);
    if (n.length <= 6) {
      return s;
    }
    s += "-" + n.slice(6, 8);
    if (n.length <= 8) {
      return s;
    }
    s += "-" + n.slice(8, 10);
    return s;
  }

  function applyPhoneInput() {
    var raw = (contactInput.value || "").replace(/\D/g, "");
    if (!raw) {
      bookingPhoneDigits = "";
      contactInput.value = "";
      return;
    }
    bookingPhoneDigits = normalizeRawDigits(raw);
    contactInput.value = formatPhoneFromDigits7(bookingPhoneDigits);
    var len = contactInput.value.length;
    requestAnimationFrame(function () {
      try {
        contactInput.setSelectionRange(len, len);
      } catch (e) {
        /* ignore */
      }
    });
  }

  function getNormalizedPhoneDigits() {
    return bookingPhoneDigits;
  }

  function isPhoneValid() {
    var d = getNormalizedPhoneDigits();
    return d.length === 11 && d[0] === "7";
  }

  function validatePhoneOnBlur() {
    applyPhoneInput();
    var d = getNormalizedPhoneDigits();
    if (d.length === 0) {
      errorMessageEl.textContent = "";
      return;
    }
    if (!isPhoneValid()) {
      errorMessageEl.textContent = "Введите корректный номер телефона";
    } else {
      errorMessageEl.textContent = "";
    }
  }

  const submitBtn = form.querySelector(".booking-submit-btn");

  function isTelegramConfigured() {
    var c = window.TELEGRAM_CONFIG;
    if (!c || typeof c.BOT_TOKEN !== "string" || typeof c.CHAT_ID !== "string") {
      return false;
    }
    if (!c.BOT_TOKEN.trim() || !c.CHAT_ID.trim()) {
      return false;
    }
    if (c.BOT_TOKEN === "YOUR_BOT_TOKEN" || c.CHAT_ID === "YOUR_CHAT_ID") {
      return false;
    }
    return true;
  }

  function buildTelegramMessage(tourName, displayName, phoneFormatted) {
    var timeStr = new Date().toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    var sourceLine =
      typeof window.BOOKING_TELEGRAM_SOURCE === "string" && window.BOOKING_TELEGRAM_SOURCE.trim()
        ? window.BOOKING_TELEGRAM_SOURCE.trim()
        : "Сайт — карточка экскурсии";
    var pageLine =
      typeof window.BOOKING_TELEGRAM_PAGE === "string" && window.BOOKING_TELEGRAM_PAGE.trim()
        ? window.BOOKING_TELEGRAM_PAGE.trim()
        : "Главная";
    return (
      "📩 Новая заявка\n\n" +
      "Источник: " +
      sourceLine +
      "\n" +
      "Страница: " +
      pageLine +
      "\n" +
      "Экскурсия: " +
      tourName +
      "\n" +
      "Имя: " +
      displayName +
      "\n" +
      "Телефон: " +
      phoneFormatted +
      "\n" +
      "Время: " +
      timeStr
    );
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    applyPhoneInput();
    if (!isPhoneValid()) {
      errorMessageEl.textContent = "Введите корректный номер телефона";
      contactInput.focus();
      return;
    }

    errorMessageEl.textContent = "";
    var digits = getNormalizedPhoneDigits();
    var contactFormatted = "+" + digits;
    var tourName = selectedTourNameEl.textContent;
    var displayName = nameInput.value.trim() || "Не указано";

    if (!isTelegramConfigured()) {
      console.error("Telegram: укажите BOT_TOKEN и CHAT_ID в config.js (замените YOUR_BOT_TOKEN и YOUR_CHAT_ID).");
      errorMessageEl.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
      return;
    }

    var cfg = window.TELEGRAM_CONFIG;
    var messageText = buildTelegramMessage(tourName, displayName, contactFormatted);
    var url = "https://api.telegram.org/bot" + cfg.BOT_TOKEN.trim() + "/sendMessage";

    if (submitBtn) {
      submitBtn.disabled = true;
    }

    try {
      var response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cfg.CHAT_ID.trim(),
          text: messageText,
        }),
      });
      var data = await response.json().catch(function () {
        return {};
      });
      if (!response.ok || !data.ok) {
        console.error("Telegram API:", data);
        throw new Error(data.description || "Telegram sendMessage failed");
      }
      console.log("booking_request", {
        tour: tourName,
        name: displayName,
        contact: contactFormatted,
        telegram: "ok",
      });
      showSuccessState();
    } catch (err) {
      console.error(err);
      errorMessageEl.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  });

  contactInput.addEventListener("input", function () {
    applyPhoneInput();
    errorMessageEl.textContent = "";
  });

  contactInput.addEventListener("blur", function () {
    validatePhoneOnBlur();
  });

  contactInput.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    var allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Enter"];
    if (allowedKeys.includes(e.key)) {
      return;
    }
    if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
    }
  });

  successCloseBtn.addEventListener("click", closePopup);
  successScrollBtn.addEventListener("click", function () {
    if (selectedProgramPageUrl) {
      if (selectedProgramPageUrl.charAt(0) === "#") {
        closePopup();
        var hashTarget = document.querySelector(selectedProgramPageUrl);
        if (hashTarget) {
          requestAnimationFrame(function () {
            hashTarget.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
        return;
      }
      window.location.href = selectedProgramPageUrl;
      return;
    }
    closePopup();
    var targetEl = selectedScrollTargetId ? document.getElementById(selectedScrollTargetId) : null;
    var fallbackEl = document.getElementById("tours");
    var destination = targetEl || fallbackEl;

    if (destination) {
      requestAnimationFrame(function () {
        destination.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });
})();
