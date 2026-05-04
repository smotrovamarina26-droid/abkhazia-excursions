(function () {
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
    }
  });
})();
