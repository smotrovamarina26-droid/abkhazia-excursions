(function () {
  const triggers = document.querySelectorAll("[data-open-contact-modal]");
  const overlay = document.getElementById("contact-overlay");
  const sheet = overlay ? overlay.querySelector(".contact-sheet") : null;
  const closeBtn = document.getElementById("contact-close");

  if (!triggers.length || !overlay || !sheet) {
    return;
  }

  let lastFocusedElement = null;

  function openModal(triggerEl) {
    lastFocusedElement = triggerEl || document.activeElement;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      if (closeBtn) {
        closeBtn.focus();
      }
    });
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      openModal(trigger);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeModal();
    }
  });
})();
