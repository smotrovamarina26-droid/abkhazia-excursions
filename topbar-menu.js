(function () {
  var bar = document.querySelector(".topbar-content");
  var burger = document.querySelector(".topbar-burger");
  var nav = document.getElementById("topbar-nav");
  if (!bar || !burger || !nav) {
    return;
  }

  function setOpen(open) {
    bar.classList.toggle("is-menu-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }

  burger.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!bar.classList.contains("is-menu-open"));
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
    if (!bar.contains(event.target)) {
      setOpen(false);
    }
  });
})();
