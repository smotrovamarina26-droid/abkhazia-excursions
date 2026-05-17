(function () {
  var bar = document.querySelector(".topbar-content");
  var burger = document.querySelector(".topbar-burger");
  var nav = document.getElementById("topbar-nav");
  if (!bar || !burger || !nav) {
    return;
  }

  var backdrop = document.querySelector(".topbar-menu-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "topbar-menu-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);
  }

  function setOpen(open) {
    bar.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("is-mobile-menu-open", open);
    backdrop.classList.toggle("is-visible", open);
    backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }

  burger.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!bar.classList.contains("is-menu-open"));
  });

  backdrop.addEventListener("click", function () {
    setOpen(false);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && bar.classList.contains("is-menu-open")) {
      setOpen(false);
    }
  });

  document.addEventListener("click", function (event) {
    if (!bar.contains(event.target) && event.target !== backdrop) {
      setOpen(false);
    }
  });
})();
