(function () {
  var METRIKA_ID = 109831964;

  window.reachMetrikaGoal = function (goalName, params) {
    if (typeof ym !== "function") {
      return;
    }
    if (params) {
      ym(METRIKA_ID, "reachGoal", goalName, params);
      return;
    }
    ym(METRIKA_ID, "reachGoal", goalName);
  };

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) {
      return;
    }

    var href = link.getAttribute("href") || "";

    if (href.indexOf("tel:") === 0) {
      window.reachMetrikaGoal("phone_click");
      return;
    }
    if (href.indexOf("wa.me/") !== -1 || href.indexOf("api.whatsapp.com") !== -1) {
      window.reachMetrikaGoal("whatsapp_click");
      return;
    }
    if (href.indexOf("max.ru/") !== -1) {
      window.reachMetrikaGoal("max_click");
      return;
    }
    if (href.indexOf("t.me/") !== -1 || href.indexOf("telegram.me/") !== -1) {
      window.reachMetrikaGoal("telegram_click");
    }
  });
})();
