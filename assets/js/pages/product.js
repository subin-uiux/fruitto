/**
 * Product page — sub-visual tab switching
 */
(function () {
  "use strict";

  var tabs = document.querySelectorAll("[data-product-tab]");
  var panels = document.querySelectorAll("[data-product-panel]");
  var titleEl = document.querySelector("[data-product-title]");
  if (!tabs.length) {
    return;
  }

  var titleMap = {
    all: "All",
    season: "사계절",
    spring: "봄",
    summer: "여름",
    autumn: "가을",
    winter: "겨울",
  };

  function activate(id) {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-product-tab") === id;
      tab.classList.toggle("is-active", isActive);
      if (isActive) {
        tab.setAttribute("aria-current", "true");
      } else {
        tab.removeAttribute("aria-current");
      }
    });

    panels.forEach(function (panel) {
      panel.classList.toggle(
        "is-active",
        panel.getAttribute("data-product-panel") === id
      );
    });

    if (titleEl) {
      titleEl.textContent = titleMap[id] || "All";
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      var id = tab.getAttribute("data-product-tab");
      if (!id) {
        return;
      }
      activate(id);
      if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
      } else {
        location.hash = id;
      }
    });
  });

  var hash = (location.hash || "#all").replace(/^#/, "");
  var valid = Array.prototype.some.call(tabs, function (tab) {
    return tab.getAttribute("data-product-tab") === hash;
  });
  activate(valid ? hash : "all");
})();
