/**
 * Store page — sub-visual tab switching (Online / Offline)
 */
(function () {
  "use strict";

  var tabs = document.querySelectorAll("[data-store-tab]");
  var panels = document.querySelectorAll("[data-store-panel]");
  var titleEl = document.querySelector("[data-store-title]");
  if (!tabs.length) {
    return;
  }

  var titleMap = {
    online: "Online",
    offline: "Offline",
  };

  function activate(id) {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-store-tab") === id;
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
        panel.getAttribute("data-store-panel") === id
      );
    });

    if (titleEl) {
      titleEl.textContent = titleMap[id] || "Online";
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      var id = tab.getAttribute("data-store-tab");
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

  var hash = (location.hash || "#online").replace(/^#/, "");
  var valid = Array.prototype.some.call(tabs, function (tab) {
    return tab.getAttribute("data-store-tab") === hash;
  });
  activate(valid ? hash : "online");
})();
