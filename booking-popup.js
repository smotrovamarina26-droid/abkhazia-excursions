(function () {
  const overlay = document.getElementById("booking-overlay");
  const popup = overlay ? overlay.querySelector(".booking-popup") : null;
  const closeBtn = document.getElementById("booking-close");
  const formState = document.getElementById("booking-form-state");
  const form = document.getElementById("booking-form");
  const successState = document.getElementById("booking-success-state");
  const successScrollBtn = document.getElementById("booking-success-scroll");
  const selectedTourNameEl = document.getElementById("selected-tour-name");
  const errorMessageEl = document.getElementById("booking-error-message");
  const nameInput = document.getElementById("booking-name");
  const contactInput = document.getElementById("booking-contact");
  const tripDateInput = document.getElementById("booking-trip-date");
  const bookButtons = document.querySelectorAll(".card-book-btn");

  if (!overlay || !popup || !formState || !form || !successState || !successScrollBtn || !selectedTourNameEl || !nameInput || !contactInput || !errorMessageEl) {
    return;
  }

  let lastFocusedElement = null;
  let bookingPhoneDigits = "";
  let pendingTelegramSource = null;
  let pendingTelegramPage = null;

  function showFormState() {
    formState.classList.remove("is-hidden");
    successState.classList.remove("is-visible");
  }

  function showSuccessState() {
    formState.classList.add("is-hidden");
    successState.classList.add("is-visible");
    successScrollBtn.focus();
  }

  function openPopup(tourName, triggerEl) {
    const name = tourName || "Экскурсия";
    selectedTourNameEl.textContent = name;
    if (triggerEl && triggerEl.getAttribute) {
      const ds = triggerEl.getAttribute("data-booking-source");
      const dp = triggerEl.getAttribute("data-booking-page");
      pendingTelegramSource = ds != null && String(ds).trim() !== "" ? String(ds).trim() : null;
      pendingTelegramPage = dp != null && String(dp).trim() !== "" ? String(dp).trim() : null;
    } else {
      pendingTelegramSource = null;
      pendingTelegramPage = null;
    }
    errorMessageEl.textContent = "";
    form.reset();
    setupTripDateInput();
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
      openPopup(button.getAttribute("data-tour-name"), button);
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
  nameInput.required = false;
  contactInput.required = true;

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

  function formatTripDate(dateRaw) {
    if (typeof dateRaw !== "string") {
      return "";
    }
    var trimmed = dateRaw.trim();
    if (!trimmed) {
      return "";
    }
    var m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
      return trimmed;
    }
    return m[3] + "." + m[2] + "." + m[1];
  }

  function toDateInputValue(dt) {
    var y = dt.getFullYear();
    var m = String(dt.getMonth() + 1).padStart(2, "0");
    var d = String(dt.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function getTomorrowDateValue() {
    var now = new Date();
    var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return toDateInputValue(tomorrow);
  }

  function setupTripDateInput() {
    if (!tripDateInput) {
      return;
    }
    tripDateInput.min = getTomorrowDateValue();
  }

  function sanitizeTripDateInput() {
    if (!tripDateInput) {
      return;
    }
    var minDate = tripDateInput.min || getTomorrowDateValue();
    if (tripDateInput.value && tripDateInput.value < minDate) {
      tripDateInput.value = "";
    }
  }

  function getTripDateLine() {
    if (!tripDateInput) {
      return "";
    }
    var tripDate = formatTripDate(tripDateInput.value);
    if (!tripDate) {
      return "";
    }
    return "Дата поездки: " + tripDate;
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
      pendingTelegramSource != null
        ? pendingTelegramSource
        : typeof window.BOOKING_TELEGRAM_SOURCE === "string" && window.BOOKING_TELEGRAM_SOURCE.trim()
          ? window.BOOKING_TELEGRAM_SOURCE.trim()
          : "Сайт — карточка экскурсии";
    var pageLine =
      pendingTelegramPage != null
        ? pendingTelegramPage
        : typeof window.BOOKING_TELEGRAM_PAGE === "string" && window.BOOKING_TELEGRAM_PAGE.trim()
          ? window.BOOKING_TELEGRAM_PAGE.trim()
          : "Главная";
    var tripDateLine = getTripDateLine();
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
      (tripDateLine ? "\n" + tripDateLine : "") +
      "\n" +
      "Время: " +
      timeStr
    );
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    applyPhoneInput();
    sanitizeTripDateInput();
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

    var savedSubmitLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 10000);

    try {
      var messageText = buildTelegramMessage(tourName, displayName, contactFormatted);

      if (!isTelegramConfigured()) {
        throw new Error("Telegram config is missing or invalid");
      }

      var cfg = window.TELEGRAM_CONFIG;
      var url = "https://api.telegram.org/bot" + cfg.BOT_TOKEN.trim() + "/sendMessage";
      var response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cfg.CHAT_ID.trim(),
          text: messageText,
        }),
        signal: controller.signal,
      });
      var data = await response.json().catch(function () {
        return {};
      });
      if (!response.ok || !data.ok) {
        throw new Error((data && data.description) || "Telegram sendMessage failed");
      }
      console.log("booking_request", {
        tour: tourName,
        name: displayName,
        contact: contactFormatted,
        telegram: "ok",
      });

      errorMessageEl.textContent = "";
      form.reset();
      bookingPhoneDigits = "";
      showSuccessState();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = savedSubmitLabel;
      }
    } catch (err) {
      console.error("Telegram send error:", err);
      errorMessageEl.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в WhatsApp, Telegram или Max.";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = savedSubmitLabel;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  });

  contactInput.addEventListener("input", function () {
    applyPhoneInput();
    errorMessageEl.textContent = "";
  });

  contactInput.addEventListener("blur", function () {
    validatePhoneOnBlur();
  });

  if (tripDateInput) {
    setupTripDateInput();
    tripDateInput.addEventListener("change", sanitizeTripDateInput);
    tripDateInput.addEventListener("input", sanitizeTripDateInput);
  }

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

  successScrollBtn.addEventListener("click", function () {
    closePopup();
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    if (/\/pages\/[^/]+\.html$/i.test(path)) {
      window.location.href = new URL("../index.html#tours", window.location.href).href;
      return;
    }
    var destination = document.getElementById("tours");
    if (destination) {
      requestAnimationFrame(function () {
        destination.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });
})();
