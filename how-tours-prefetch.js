(function () {
  var grid = document.querySelector(".how-tours-grid");
  if (!grid) {
    return;
  }

  function prefetchGalleryImages() {
    var images = grid.querySelectorAll("img[src]");
    images.forEach(function (img) {
      var url = img.getAttribute("src");
      if (!url) {
        return;
      }
      var loader = new Image();
      loader.decoding = "async";
      loader.src = url;
    });
  }

  function schedulePrefetch() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(prefetchGalleryImages, { timeout: 2500 });
    } else {
      setTimeout(prefetchGalleryImages, 200);
    }
  }

  if (document.readyState === "complete") {
    schedulePrefetch();
  } else {
    window.addEventListener("load", schedulePrefetch, { once: true });
  }
})();
