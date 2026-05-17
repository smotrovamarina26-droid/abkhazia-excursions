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

  var lockedScrollY = 0;
  var touchMoveBlocker = null;
  var wheelBlocker = null;
  var mobileMedia = window.matchMedia("(max-width: 768px)");

  function isMobileMenuContext() {
    return mobileMedia.matches;
  }

  function allowMenuScroll(target) {
    return nav && (nav === target || nav.contains(target));
  }

  function onTouchMove(event) {
    if (allowMenuScroll(event.target)) {
      return;
    }
    event.preventDefault();
  }

  function onWheel(event) {
    if (allowMenuScroll(event.target)) {
      return;
    }
    event.preventDefault();
  }

  function lockPageScroll() {
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("is-mobile-menu-open");
    document.body.classList.add("is-mobile-menu-open");
    document.body.style.position = "fixed";
    document.body.style.top = "-" + lockedScrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    touchMoveBlocker = onTouchMove;
    wheelBlocker = onWheel;
    document.addEventListener("touchmove", touchMoveBlocker, { passive: false });
    document.addEventListener("wheel", wheelBlocker, { passive: false });
  }

  function unlockPageScroll(restoreScrollPosition) {
    document.documentElement.classList.remove("is-mobile-menu-open");
    document.body.classList.remove("is-mobile-menu-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    if (touchMoveBlocker) {
      document.removeEventListener("touchmove", touchMoveBlocker, { passive: false });
      touchMoveBlocker = null;
    }
    if (wheelBlocker) {
      document.removeEventListener("wheel", wheelBlocker, { passive: false });
      wheelBlocker = null;
    }

    if (restoreScrollPosition !== false) {
      window.scrollTo(0, lockedScrollY);
    }
  }

  function setOpen(open, options) {
    options = options || {};
    var wasOpen = bar.classList.contains("is-menu-open");

    bar.classList.toggle("is-menu-open", open);
    backdrop.classList.toggle("is-visible", open);
    backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");

    if (isMobileMenuContext()) {
      if (open && !wasOpen) {
        lockPageScroll();
      } else if (!open && wasOpen) {
        unlockPageScroll(options.restoreScrollPosition);
      }
    } else {
      document.documentElement.classList.toggle("is-mobile-menu-open", open);
      document.body.classList.toggle("is-mobile-menu-open", open);
    }
  }

  function scrollToSection(hash) {
    var id = hash.charAt(0) === "#" ? hash.slice(1) : hash;
    var target = document.getElementById(id);
    if (!target) {
      return false;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", "#" + id);
        } else {
          window.location.hash = id;
        }
      });
    });

    return true;
  }

  burger.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!bar.classList.contains("is-menu-open"));
  });

  backdrop.addEventListener("click", function () {
    setOpen(false);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href");
      var isInPageAnchor = href && href.charAt(0) === "#" && href.length > 1;
      var wasOpen = bar.classList.contains("is-menu-open");

      if (isInPageAnchor && document.getElementById(href.slice(1))) {
        event.preventDefault();

        if (wasOpen) {
          setOpen(false, { restoreScrollPosition: true });
        }

        scrollToSection(href);
        return;
      }

      if (wasOpen) {
        setOpen(false);
      }
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
