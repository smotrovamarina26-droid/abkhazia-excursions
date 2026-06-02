(function () {
  var selectors = ["#tour-tourists-gallery", "#tour-route-photos"];

  function prefetchImages(selector) {
    var root = document.querySelector(selector);
    if (!root) {
      return;
    }
    root.querySelectorAll("img[src]").forEach(function (img) {
      var url = img.getAttribute("src");
      if (!url) {
        return;
      }
      var loader = new Image();
      loader.decoding = "async";
      loader.src = url;
    });
  }

  function prefetchTourGalleries() {
    selectors.forEach(prefetchImages);
  }

  function schedulePrefetch() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(prefetchTourGalleries, { timeout: 2500 });
    } else {
      setTimeout(prefetchTourGalleries, 200);
    }
  }

  if (!document.querySelector(".tour-page")) {
    return;
  }

  if (document.readyState === "complete") {
    schedulePrefetch();
  } else {
    window.addEventListener("load", schedulePrefetch, { once: true });
  }
})();
