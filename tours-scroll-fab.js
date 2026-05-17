(function () {
  var toursSection = document.getElementById("tours");
  var scrollButton = document.getElementById("tours-scroll-fab");

  if (!toursSection || !scrollButton) {
    return;
  }

  var ticking = false;

  function updateVisibility() {
    var show = toursSection.getBoundingClientRect().bottom < 0;

    scrollButton.classList.toggle("is-visible", show);
    scrollButton.hidden = !show;
    scrollButton.setAttribute("aria-hidden", show ? "false" : "true");
    ticking = false;
  }

  function scheduleUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateVisibility);
    }
  }

  scrollButton.addEventListener("click", function () {
    toursSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  updateVisibility();
})();
