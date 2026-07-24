/**
 * Common — Header scroll show/hide · Mobile nav drawer
 */
(function () {
  "use strict";

  var header = document.querySelector(".header:not(.header--static)");
  var menuBtn = document.querySelector("[data-nav-open]");
  var closeBtn = document.querySelector("[data-nav-close]");
  var drawer = document.getElementById("nav-drawer");
  var dim = document.getElementById("nav-drawer-dim");
  var lastScrollY = window.scrollY || 0;
  var ticking = false;

  function isNavOpen() {
    return document.body.classList.contains("is-nav-open");
  }

  function openNav() {
    if (!drawer || !dim) {
      return;
    }
    document.body.classList.add("is-nav-open");
    document.body.style.overflow = "hidden";
    if (header) {
      header.classList.add("header--nav-open");
      header.classList.remove("header--hidden");
    }
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "true");
    }
    dim.classList.add("is-open");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeNav() {
    if (!drawer || !dim) {
      return;
    }
    document.body.classList.remove("is-nav-open");
    document.body.style.overflow = "";
    if (header) {
      header.classList.remove("header--nav-open");
    }
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
    }
    dim.classList.remove("is-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      if (isNavOpen()) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeNav);
  }

  if (dim) {
    dim.addEventListener("click", closeNav);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isNavOpen()) {
      closeNav();
    }
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 64rem)").matches && isNavOpen()) {
      closeNav();
    }
  });

  /* Scroll: down hide / up show (메뉴 열린 상태에서는 유지) */
  function onScroll() {
    if (!header || isNavOpen()) {
      ticking = false;
      return;
    }

    var currentY = window.scrollY || 0;

    if (currentY <= 0) {
      header.classList.remove("header--hidden");
    } else if (currentY > lastScrollY && currentY > 80) {
      header.classList.add("header--hidden");
    } else if (currentY < lastScrollY) {
      header.classList.remove("header--hidden");
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  /* Accordion submenu — smooth slide */
  if (drawer) {
    drawer.querySelectorAll(".nav-drawer__toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var item = toggle.closest(".nav-drawer__item");
        var isOpen = toggle.getAttribute("aria-expanded") === "true";

        drawer.querySelectorAll(".nav-drawer__item--has-sub").forEach(function (other) {
          if (other === item) {
            return;
          }
          other.classList.remove("is-open");
          var otherToggle = other.querySelector(".nav-drawer__toggle");
          if (otherToggle) {
            otherToggle.setAttribute("aria-expanded", "false");
          }
        });

        if (isOpen) {
          item.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("is-open");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* Product Popup open / close */
  var openButtons = document.querySelectorAll("[data-popup-open]");
  var closeButtons = document.querySelectorAll("[data-popup-close]");

  function openPopup(id) {
    var popupDim = document.getElementById(id);
    if (!popupDim) {
      return;
    }
    popupDim.hidden = false;
    popupDim.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      popupDim.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closePopup(popupDim) {
    if (!popupDim) {
      return;
    }
    popupDim.classList.remove("is-open");
    popupDim.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      if (!popupDim.classList.contains("is-open")) {
        popupDim.hidden = true;
      }
    }, 250);
  }

  openButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      openPopup(btn.getAttribute("data-popup-open"));
    });
  });

  closeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      closePopup(btn.closest(".product-popup-dim"));
    });
  });

  document.querySelectorAll(".product-popup-dim").forEach(function (popupDim) {
    popupDim.addEventListener("click", function (e) {
      if (e.target === popupDim) {
        closePopup(popupDim);
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") {
      return;
    }
    document.querySelectorAll(".product-popup-dim.is-open").forEach(function (popupDim) {
      closePopup(popupDim);
    });
  });
})();
