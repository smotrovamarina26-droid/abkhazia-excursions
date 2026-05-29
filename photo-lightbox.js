(function () {
  var main = document.querySelector("main");
  if (!main || !main.querySelector(".how-tours-grid")) {
    return;
  }

  var ROUTES_SELECTOR = ".how-tours-grid img";
  var routesGallery = [];
  var lockedScrollY = 0;
  var currentGallery = [];
  var currentIndex = 0;
  var touchStartX = 0;
  var touchStartY = 0;

  var root = document.createElement("div");
  root.className = "photo-lightbox";
  root.id = "photo-lightbox";
  root.setAttribute("aria-hidden", "true");
  root.hidden = true;
  root.innerHTML =
    '<div class="photo-lightbox__backdrop" data-lightbox-close></div>' +
    '<div class="photo-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Просмотр фото">' +
    '<button type="button" class="photo-lightbox__close" aria-label="Закрыть">×</button>' +
    '<figure class="photo-lightbox__figure">' +
    '<div class="photo-lightbox__media">' +
    '<button type="button" class="photo-lightbox__nav tour-tourists-gallery__arrow tour-tourists-gallery__arrow--prev" aria-label="Предыдущее фото">' +
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M11 4L6 9l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    "</button>" +
    '<img class="photo-lightbox__img" alt="" decoding="async">' +
    '<button type="button" class="photo-lightbox__nav tour-tourists-gallery__arrow tour-tourists-gallery__arrow--next" aria-label="Следующее фото">' +
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M7 4l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    "</button>" +
    "</div>" +
    '<div class="photo-lightbox__dots tour-tourists-gallery__dots" role="group" aria-label="Навигация по фотографиям" hidden></div>' +
    '<figcaption class="photo-lightbox__caption"></figcaption>' +
    "</figure></div>";
  document.body.appendChild(root);

  var backdrop = root.querySelector(".photo-lightbox__backdrop");
  var dialog = root.querySelector(".photo-lightbox__dialog");
  var closeBtn = root.querySelector(".photo-lightbox__close");
  var prevBtn = root.querySelector(".photo-lightbox__nav.tour-tourists-gallery__arrow--prev");
  var nextBtn = root.querySelector(".photo-lightbox__nav.tour-tourists-gallery__arrow--next");
  var imageEl = root.querySelector(".photo-lightbox__img");
  var captionEl = root.querySelector(".photo-lightbox__caption");
  var dotsRoot = root.querySelector(".photo-lightbox__dots");
  var dotButtons = [];

  function buildRoutesGallery() {
    var nodes = main.querySelectorAll(ROUTES_SELECTOR);
    routesGallery = Array.prototype.map.call(nodes, function (img) {
      return {
        src: img.currentSrc || img.src,
        alt: img.getAttribute("alt") || "",
      };
    });

    Array.prototype.forEach.call(nodes, function (img, index) {
      img.dataset.lightboxIndex = String(index);
    });
  }

  function lockScroll() {
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("is-photo-lightbox-open");
    document.body.classList.add("is-photo-lightbox-open");
    document.body.style.position = "fixed";
    document.body.style.top = "-" + lockedScrollY + "px";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    var scrollY =
      Math.abs(parseInt(document.body.style.top || "0", 10)) || lockedScrollY;

    document.documentElement.classList.remove("is-photo-lightbox-open");
    document.body.classList.remove("is-photo-lightbox-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    var html = document.documentElement;
    var prevHtmlScrollBehavior = html.style.scrollBehavior;
    var prevBodyScrollBehavior = document.body.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";

    if (typeof window.scrollTo === "function") {
      try {
        window.scrollTo({ left: 0, top: scrollY, behavior: "instant" });
      } catch (error) {
        window.scrollTo(0, scrollY);
      }
    }

    html.style.scrollBehavior = prevHtmlScrollBehavior;
    document.body.style.scrollBehavior = prevBodyScrollBehavior;
    lockedScrollY = 0;
  }

  function buildDots() {
    if (!dotsRoot) {
      return;
    }
    dotsRoot.innerHTML = "";
    dotButtons = [];
    if (currentGallery.length <= 1) {
      dotsRoot.hidden = true;
      return;
    }
    dotsRoot.hidden = false;
    for (var i = 0; i < currentGallery.length; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tour-tourists-gallery__dot";
      btn.setAttribute("aria-label", "Фото " + (i + 1) + " из " + currentGallery.length);
      (function (index) {
        btn.addEventListener("click", function () {
          currentIndex = index;
          renderSlide();
        });
      })(i);
      dotsRoot.appendChild(btn);
      dotButtons.push(btn);
    }
  }

  function updateDots() {
    dotButtons.forEach(function (btn, index) {
      var on = index === currentIndex;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  function updateNav() {
    var hasMany = currentGallery.length > 1;
    prevBtn.hidden = !hasMany;
    nextBtn.hidden = !hasMany;
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= currentGallery.length - 1;
  }

  function renderSlide() {
    var slide = currentGallery[currentIndex];
    if (!slide) {
      return;
    }

    imageEl.src = slide.src;
    imageEl.alt = slide.alt;
    captionEl.textContent = slide.alt;
    captionEl.hidden = !slide.alt;
    updateNav();
    updateDots();
  }

  function open(index) {
    currentGallery = routesGallery;
    if (!currentGallery.length) {
      return;
    }

    currentIndex = Math.max(0, Math.min(index, currentGallery.length - 1));
    buildDots();
    renderSlide();
    lockScroll();
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      root.classList.add("is-open");
    });
    closeBtn.focus();
  }

  function close() {
    if (!root.classList.contains("is-open")) {
      return;
    }

    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    unlockScroll();

    window.setTimeout(function () {
      root.hidden = true;
      imageEl.removeAttribute("src");
    }, 220);
  }

  function step(delta) {
    if (currentGallery.length < 2) {
      return;
    }
    var nextIndex = currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= currentGallery.length) {
      return;
    }
    currentIndex = nextIndex;
    renderSlide();
  }

  function onTriggerClick(event) {
    var index = parseInt(event.currentTarget.dataset.lightboxIndex, 10);
    if (isNaN(index)) {
      return;
    }
    event.preventDefault();
    open(index);
  }

  buildRoutesGallery();

  main.querySelectorAll(ROUTES_SELECTOR).forEach(function (img) {
    img.addEventListener("click", onTriggerClick);
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () {
    step(-1);
  });
  nextBtn.addEventListener("click", function () {
    step(1);
  });

  backdrop.addEventListener("click", close);
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      close();
    }
  });

  root.addEventListener("click", function (event) {
    if (event.target === root) {
      close();
    }
  });

  imageEl.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("keydown", function (event) {
    if (!root.classList.contains("is-open")) {
      return;
    }
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowLeft") {
      step(-1);
    } else if (event.key === "ArrowRight") {
      step(1);
    }
  });

  root.addEventListener(
    "touchstart",
    function (event) {
      if (!event.changedTouches || !event.changedTouches.length) {
        return;
      }
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    function (event) {
      if (!event.changedTouches || !event.changedTouches.length) {
        return;
      }
      var touch = event.changedTouches[0];
      var deltaX = touch.clientX - touchStartX;
      var deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }
      if (deltaX < 0) {
        step(1);
      } else {
        step(-1);
      }
    },
    { passive: true }
  );
})();
