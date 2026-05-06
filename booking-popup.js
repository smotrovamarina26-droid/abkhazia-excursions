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
  let pendingBookingSource = null;
  let pendingBookingPage = null;
  let hasSubmitErrorState = false;
  const SUBMIT_ERROR_CALL_HREF = "tel:+79678007552";
  const BOOKING_API_URL = "https://abkhazia-excursions.vercel.app/api/telegram-booking";

  function handleSubmitErrorContactNavigation(event) {
    var link = event.target && event.target.closest ? event.target.closest("[data-submit-error-contact]") : null;
    if (!link || !errorMessageEl.contains(link)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    var href = link.getAttribute("href");
    if (href) {
      window.location.href = href;
    }
  }

  function clearErrorMessage() {
    errorMessageEl.textContent = "";
  }

  function setErrorMessageText(message) {
    errorMessageEl.textContent = message;
  }

  function setSubmitErrorWithContacts() {
    hasSubmitErrorState = true;
    hideSubmitButton();
    errorMessageEl.innerHTML =
      '<p class="booking-error-text">Не удалось отправить заявку автоматически. Позвоните нам — поможем забронировать экскурсию.</p>' +
      '<div class="contact-sheet-actions">' +
      '<a href="' +
      SUBMIT_ERROR_CALL_HREF +
      '" class="contact-sheet-btn contact-sheet-btn--primary" data-submit-error-contact>Позвонить</a>' +
      "</div>";
  }

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
      pendingBookingSource = ds != null && String(ds).trim() !== "" ? String(ds).trim() : null;
      pendingBookingPage = dp != null && String(dp).trim() !== "" ? String(dp).trim() : null;
    } else {
      pendingBookingSource = null;
      pendingBookingPage = null;
    }
    resetSubmitErrorState();
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
  errorMessageEl.addEventListener("click", handleSubmitErrorContactNavigation);
  errorMessageEl.addEventListener("touchend", handleSubmitErrorContactNavigation);

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
    if (hasSubmitErrorState) {
      return;
    }
    var d = getNormalizedPhoneDigits();
    if (d.length === 0) {
      clearErrorMessage();
      return;
    }
    if (!isPhoneValid()) {
      setErrorMessageText("Введите корректный номер телефона");
    } else {
      clearErrorMessage();
    }
  }

  const submitBtn = form.querySelector(".booking-submit-btn");
  nameInput.required = false;
  contactInput.required = true;

  function showSubmitButton() {
    if (!submitBtn) {
      return;
    }
    submitBtn.style.display = "";
    submitBtn.disabled = false;
  }

  function hideSubmitButton() {
    if (!submitBtn) {
      return;
    }
    submitBtn.style.display = "none";
    submitBtn.disabled = true;
  }

  function resetSubmitErrorState() {
    hasSubmitErrorState = false;
    clearErrorMessage();
    showSubmitButton();
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

  function fieldOrEmpty(value) {
    if (value == null) {
      return "";
    }
    return String(value).trim();
  }

  function buildBookingPayload(tourName, nameStr, phoneStr) {
    var source =
      pendingBookingSource != null
        ? fieldOrEmpty(pendingBookingSource)
        : typeof window.BOOKING_TELEGRAM_SOURCE === "string"
          ? fieldOrEmpty(window.BOOKING_TELEGRAM_SOURCE)
          : "";
    var page =
      pendingBookingPage != null
        ? fieldOrEmpty(pendingBookingPage)
        : typeof window.BOOKING_TELEGRAM_PAGE === "string"
          ? fieldOrEmpty(window.BOOKING_TELEGRAM_PAGE)
          : "";
    var dateVal =
      tripDateInput && typeof tripDateInput.value === "string" ? formatTripDate(tripDateInput.value) : "";
    return {
      name: fieldOrEmpty(nameStr),
      phone: fieldOrEmpty(phoneStr),
      tour: fieldOrEmpty(tourName),
      source: source,
      page: page,
      date: dateVal,
      comment: "",
    };
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
      setErrorMessageText("Введите корректный номер телефона");
      contactInput.focus();
      return;
    }

    clearErrorMessage();
    var digits = getNormalizedPhoneDigits();
    var contactFormatted = "+" + digits;
    var tourName = selectedTourNameEl.textContent;
    var displayName = nameInput.value.trim();

    var savedSubmitLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 10000);

    try {
      var payload = buildBookingPayload(tourName, displayName, contactFormatted);
      var response = await fetch(BOOKING_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      var data = await response.json().catch(function () {
        return {};
      });
      if (!response.ok || data.ok !== true) {
        throw new Error((data && data.error) || (data && data.description) || "Booking request failed");
      }
      console.log("booking_request", {
        tour: tourName,
        name: displayName || "",
        contact: contactFormatted,
        api: "ok",
      });

      clearErrorMessage();
      form.reset();
      bookingPhoneDigits = "";
      hasSubmitErrorState = false;
      showSuccessState();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = savedSubmitLabel;
      }
    } catch (err) {
      console.error("Booking submit error:", err);
      setSubmitErrorWithContacts();
      if (submitBtn) {
        submitBtn.textContent = savedSubmitLabel;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  });

  contactInput.addEventListener("input", function () {
    applyPhoneInput();
    if (hasSubmitErrorState) {
      resetSubmitErrorState();
      return;
    }
    clearErrorMessage();
  });

  nameInput.addEventListener("input", function () {
    if (hasSubmitErrorState) {
      resetSubmitErrorState();
    }
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
