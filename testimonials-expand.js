(function () {
  function getAuthorName(authorEl) {
    var stars = authorEl.querySelector(".testimonial-stars");
    var name = authorEl.textContent.replace(/\s+/g, " ").trim();
    if (stars) {
      name = name.replace(stars.textContent, "").trim();
    }
    return name;
  }

  function getAuthorInitial(authorEl) {
    var name = getAuthorName(authorEl);
    var match = name.match(/[A-Za-zА-Яа-яЁё]/);
    return match ? match[0].toLocaleUpperCase("ru-RU") : "?";
  }

  function initTestimonialAvatars() {
    var grid = document.querySelector(".testimonials .testimonials-grid");
    if (!grid) {
      return;
    }

    grid.querySelectorAll(".trust-item").forEach(function (item) {
      if (item.querySelector(".testimonial-head")) {
        return;
      }

      var author = item.querySelector(".testimonial-author");
      if (!author) {
        return;
      }

      var route = item.querySelector(".testimonial-route");
      var head = document.createElement("div");
      var avatar = document.createElement("span");
      var meta = document.createElement("div");

      head.className = "testimonial-head";
      avatar.className = "testimonial-avatar avatar-circle";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = getAuthorInitial(author);
      meta.className = "testimonial-head__meta";

      head.appendChild(avatar);
      meta.appendChild(author);
      if (route) {
        meta.appendChild(route);
      }
      head.appendChild(meta);
      item.insertBefore(head, item.firstChild);
    });
  }

  initTestimonialAvatars();

  var btn = document.getElementById("testimonials-show-more");
  if (!btn) return;

  var LABEL_EXPAND = "Показать ещё отзывы";
  var LABEL_COLLAPSE = "Скрыть отзывы";

  var extraIds = (btn.getAttribute("aria-controls") || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  btn.addEventListener("click", function () {
    var expanded = btn.getAttribute("aria-expanded") === "true";
    if (expanded) {
      extraIds.forEach(function (el) {
        el.setAttribute("hidden", "");
      });
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = LABEL_EXPAND;
    } else {
      extraIds.forEach(function (el) {
        el.removeAttribute("hidden");
      });
      btn.setAttribute("aria-expanded", "true");
      btn.textContent = LABEL_COLLAPSE;
      initToggles(extraIds);
    }
  });

  function initToggles(scope) {
    var containers = scope || [document];
    containers.forEach(function (root) {
      var bodies = root.querySelectorAll
        ? root.querySelectorAll(".testimonial-body")
        : [];
      bodies.forEach(setupToggle);
    });
  }

  function setupToggle(body) {
    var toggle = body.parentElement.querySelector(".testimonial-toggle");
    if (!toggle || toggle.dataset.init) return;
    toggle.dataset.init = "1";

    if (body.scrollHeight <= body.offsetHeight + 2) return;

    toggle.classList.add("is-visible");
    toggle.addEventListener("click", function () {
      var expanded = body.classList.contains("is-expanded");
      if (expanded) {
        body.classList.remove("is-expanded");
        toggle.textContent = "Читать полностью";
      } else {
        body.classList.add("is-expanded");
        toggle.textContent = "Скрыть";
      }
    });
  }

  document.querySelectorAll(".testimonial-body").forEach(setupToggle);
})();
