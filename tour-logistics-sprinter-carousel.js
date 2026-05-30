(function () {
  var section = document.getElementById("tour-logistics");
  if (!section) {
    return;
  }
  var track = section.querySelector(".tour-logistics-sprinter-carousel__track");
  var prevBtn = section.querySelector(".tour-logistics-sprinter-carousel__arrow--prev");
  var nextBtn = section.querySelector(".tour-logistics-sprinter-carousel__arrow--next");
  if (!track) {
    return;
  }

  var slides = track.querySelectorAll(".tour-logistics-sprinter-carousel__slide");
  var n = slides.length;

  function getIndex() {
    var w = track.clientWidth;
    if (w <= 0) {
      return 0;
    }
    return Math.round(track.scrollLeft / w);
  }

  function updateArrows() {
    var i = getIndex();
    if (n <= 1) {
      if (prevBtn) {
        prevBtn.hidden = true;
      }
      if (nextBtn) {
        nextBtn.hidden = true;
      }
      return;
    }
    if (prevBtn) {
      prevBtn.hidden = i <= 0;
    }
    if (nextBtn) {
      nextBtn.hidden = i >= n - 1;
    }
  }

  function goTo(index) {
    if (index < 0 || index >= n) {
      return;
    }
    var w = track.clientWidth;
    track.scrollTo({ left: index * w, behavior: "smooth" });
  }

  if (n <= 1) {
    updateArrows();
    return;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      goTo(getIndex() - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      goTo(getIndex() + 1);
    });
  }

  track.addEventListener("scroll", updateArrows, { passive: true });

  window.addEventListener(
    "resize",
    function () {
      var w = track.clientWidth;
      if (w <= 0) {
        return;
      }
      var i = Math.round(track.scrollLeft / w);
      track.scrollLeft = i * w;
      updateArrows();
    },
    { passive: true }
  );

  track.addEventListener("keydown", function (e) {
    var i = getIndex();
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(Math.min(i + 1, n - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(Math.max(i - 1, 0));
    }
  });

  updateArrows();
})();
