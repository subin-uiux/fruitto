/**
 * Notice page — tab switching, accordion, search
 */
(function () {
  "use strict";

  var tabs = document.querySelectorAll("[data-notice-tab]");
  var panels = document.querySelectorAll("[data-notice-panel]");
  var titleEl = document.querySelector("[data-notice-title]");
  var countEl = document.querySelector("[data-notice-count]");
  var searchForm = document.querySelector("[data-notice-search]");
  var searchInput = document.querySelector("[data-notice-search-input]");
  var items = document.querySelectorAll(".notice-item");

  var titleMap = {
    notice: "Notice",
    event: "Event",
    promotion: "Promotion",
  };

  function activate(id) {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-notice-tab") === id;
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
        panel.getAttribute("data-notice-panel") === id
      );
    });

    if (titleEl) {
      titleEl.textContent = titleMap[id] || "Notice";
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      var id = tab.getAttribute("data-notice-tab");
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

  /* Accordion */
  items.forEach(function (item) {
    var trigger = item.querySelector(".notice-item__trigger");
    if (!trigger) {
      return;
    }
    trigger.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      items.forEach(function (other) {
        other.classList.remove("is-open");
        var otherTrigger = other.querySelector(".notice-item__trigger");
        if (otherTrigger) {
          otherTrigger.setAttribute("aria-expanded", "false");
        }
      });
      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Search — 공지사항 목록 필터 */
  function updateCount() {
    if (!countEl) {
      return;
    }
    var visible = 0;
    items.forEach(function (item) {
      if (!item.classList.contains("is-hidden")) {
        visible += 1;
      }
    });
    countEl.textContent = String(visible);
  }

  function filterItems(query) {
    var q = (query || "").trim().toLowerCase();
    items.forEach(function (item) {
      var title = item.querySelector(".notice-item__title");
      var text = title ? title.textContent.toLowerCase() : "";
      var match = !q || text.indexOf(q) !== -1;
      item.classList.toggle("is-hidden", !match);
      if (!match) {
        item.classList.remove("is-open");
        var trigger = item.querySelector(".notice-item__trigger");
        if (trigger) {
          trigger.setAttribute("aria-expanded", "false");
        }
      }
    });
    updateCount();
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      filterItems(searchInput.value);
    });
    searchInput.addEventListener("input", function () {
      filterItems(searchInput.value);
    });
  }

  /* Event / Promotion — ongoing / ended toggle */
  document.querySelectorAll("[data-board-toggle]").forEach(function (toggle) {
    var board = toggle.closest(".notice-board");
    if (!board) {
      return;
    }
    var buttons = toggle.querySelectorAll("[data-board-filter]");
    var boardPanels = board.querySelectorAll("[data-board-panel]");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-board-filter");
        if (!filter) {
          return;
        }

        buttons.forEach(function (other) {
          var active = other === btn;
          other.classList.toggle("toggle__item--active", active);
          other.setAttribute("aria-pressed", active ? "true" : "false");
        });

        boardPanels.forEach(function (panel) {
          var match = panel.getAttribute("data-board-panel") === filter;
          panel.classList.toggle("is-active", match);
          panel.hidden = !match;
        });
      });
    });
  });

  var hash = (location.hash || "#notice").replace(/^#/, "");
  var valid = Array.prototype.some.call(tabs, function (tab) {
    return tab.getAttribute("data-notice-tab") === hash;
  });
  activate(valid ? hash : "notice");
})();
