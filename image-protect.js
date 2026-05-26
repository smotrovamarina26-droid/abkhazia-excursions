(function () {
  document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });

  var imgs = document.querySelectorAll('img');
  for (var i = 0; i < imgs.length; i++) {
    imgs[i].setAttribute('draggable', 'false');
    imgs[i].addEventListener('contextmenu', function (e) {
      e.preventDefault();
      return false;
    });
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.tagName === 'IMG') {
          node.setAttribute('draggable', 'false');
          node.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            return false;
          });
        }
        if (node.querySelectorAll) {
          var newImgs = node.querySelectorAll('img');
          for (var i = 0; i < newImgs.length; i++) {
            newImgs[i].setAttribute('draggable', 'false');
            newImgs[i].addEventListener('contextmenu', function (e) {
              e.preventDefault();
              return false;
            });
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
