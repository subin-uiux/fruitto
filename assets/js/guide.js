/**
 * Component Guide — interactive demo
 */
(function () {
  "use strict";

  document.querySelectorAll(".toggle:not(.toggle--static)").forEach(function (toggle) {
    var items = toggle.querySelectorAll(".toggle__item");

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        if (item.disabled) {
          return;
        }

        items.forEach(function (btn) {
          btn.classList.remove("toggle__item--active");
          btn.setAttribute("aria-pressed", "false");
        });

        item.classList.add("toggle__item--active");
        item.setAttribute("aria-pressed", "true");
      });
    });
  });
})();
