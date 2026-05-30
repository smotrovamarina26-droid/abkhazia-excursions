(function () {
  var section = document.getElementById("tour-tourists-gallery");
  if (!section) {
    return;
  }

  var slider = section.querySelector(".tour-tourists-gallery__slider");
  var dotsContainer = section.querySelector(".tour-tourists-gallery__dots");
  var prevBtn = section.querySelector(".tour-tourists-gallery__arrow--prev");
  var nextBtn = section.querySelector(".tour-tourists-gallery__arrow--next");
  if (!slider || !dotsContainer) {
    return;
  }

  var cards = slider.querySelectorAll(".tour-tourists-gallery__card");
  var total = cards.length;
  if (!total) {
    return;
  }

  var dots = [];
  for (var i = 0; i < total; i++) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "tour-tourists-gallery__dot";
    dot.setAttribute("aria-label", "Фото " + (i + 1) + " из " + total);
    (function (index) {
      dot.addEventListener("click", function () {
        scrollToIndex(index);
      });
    })(i);
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  var currentIndex = 0;

  function getClosestIndex() {
    var sliderLeft = slider.scrollLeft;
    var sliderWidth = slider.offsetWidth;
    var centerX = sliderLeft + sliderWidth / 2;
    var closest = 0;
    var minDist = Infinity;

    for (var j = 0; j < cards.length; j++) {
      var cardCenter = cards[j].offsetLeft + cards[j].offsetWidth / 2;
      var dist = Math.abs(cardCenter - centerX);
      if (dist < minDist) {
        minDist = dist;
        closest = j;
      }
    }
    return closest;
  }

  function updateArrows(index) {
    if (total <= 1) {
      if (prevBtn) {
        prevBtn.hidden = true;
      }
      if (nextBtn) {
        nextBtn.hidden = true;
      }
      return;
    }
    if (prevBtn) {
      prevBtn.hidden = index <= 0;
    }
    if (nextBtn) {
      nextBtn.hidden = index >= total - 1;
    }
  }

  function updateDots() {
    var idx = getClosestIndex();
    if (idx !== currentIndex) {
      currentIndex = idx;
      for (var k = 0; k < dots.length; k++) {
        dots[k].classList.toggle("is-active", k === currentIndex);
      }
    }
    updateArrows(idx);
  }

  function scrollToIndex(index) {
    if (index < 0 || index >= total) {
      return;
    }
    var card = cards[index];
    var scrollTarget = card.offsetLeft - (slider.offsetWidth - card.offsetWidth) / 2;
    slider.scrollTo({ left: scrollTarget, behavior: "smooth" });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      scrollToIndex(getClosestIndex() - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      scrollToIndex(getClosestIndex() + 1);
    });
  }

  dots[0].classList.add("is-active");
  updateArrows(0);
  slider.addEventListener("scroll", updateDots, { passive: true });

  window.addEventListener(
    "resize",
    function () {
      updateDots();
    },
    { passive: true }
  );
})();
