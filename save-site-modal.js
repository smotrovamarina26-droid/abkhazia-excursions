(function () {
  var MESSAGE =
    "Здравствуйте! Планирую отдых в Сочи. Пришлите, пожалуйста, информацию по экскурсиям в Абхазию и ссылку на сайт.";

  var MESSENGERS = {
    whatsapp: {
      url: "https://wa.me/79678007552",
      goal: "save_site_whatsapp",
    },
    telegram: {
      url: "https://t.me/Marina_Sochi_Adler",
      goal: "save_site_telegram",
    },
    max: {
      url: "https://max.ru/u/f9LHodD0cOLcIavsnmkmUaQOuLh2m5zb_CNUB02shmV-u5GIclKKnWoflec",
      goal: "save_site_max",
    },
  };

  var trigger = document.getElementById("save-site-trigger");
  var overlay = document.getElementById("save-site-overlay");
  var closeBtn = document.getElementById("save-site-close");

  if (!trigger || !overlay) {
    return;
  }

  var lastFocusedElement = null;

  function buildMessengerHref(baseUrl) {
    var encoded = encodeURIComponent(MESSAGE);
    var separator = baseUrl.indexOf("?") === -1 ? "?" : "&";
    return baseUrl + separator + "text=" + encoded;
  }

  function reachGoal(name) {
    if (typeof window.reachMetrikaGoal === "function") {
      window.reachMetrikaGoal(name);
    }
  }

  function openModal() {
    lastFocusedElement = document.activeElement;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    reachGoal("save_site_open");
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

  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    openModal();
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

  overlay.querySelectorAll("[data-save-site-messenger]").forEach(function (link) {
    var key = link.getAttribute("data-save-site-messenger");
    var config = MESSENGERS[key];
    if (!config) {
      return;
    }

    link.href = buildMessengerHref(config.url);
    link.target = "_blank";

    link.addEventListener("click", function () {
      reachGoal(config.goal);
      closeModal();
    });
  });
})();
