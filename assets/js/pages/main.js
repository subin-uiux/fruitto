/**
 * Main page — AOS
 */
(function () {
  "use strict";

  if (typeof AOS === "undefined") {
    return;
  }

  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: false,
    mirror: true,
    offset: 80,
    disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
})();

/**
 * Main page — KV GSAP slider
 * Inspired by: https://codepen.io/yudizsolutions/pen/QWoqmWW
 */
(function () {
  "use strict";

  var kv = document.querySelector(".kv");
  if (!kv || typeof gsap === "undefined") {
    return;
  }

  var track = kv.querySelector(".kv__track");
  var slides = kv.querySelectorAll(".kv__slide");
  var prevBtn = kv.querySelector("[data-kv-prev]");
  var nextBtn = kv.querySelector("[data-kv-next]");
  var dots = kv.querySelectorAll(".kv__dot");
  var total = slides.length;
  var current = 0;
  var isAnimating = false;
  var autoTimer = null;
  var AUTO_DELAY = 4500;

  function setActiveDot(index) {
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function prepareSlideContent(slide) {
    var brand = slide.querySelector(".kv__brand");
    var product = slide.querySelector(".kv__product");
    var tagline = slide.querySelector(".kv__tagline");

    gsap.killTweensOf([brand, product, tagline]);
    gsap.set(brand, { opacity: 0, scale: 0.97 });
    gsap.set(product, { opacity: 0, y: 28, scale: 0.98 });
    gsap.set(tagline, { opacity: 0, y: 12 });
  }

  function animateSlideContent(slide) {
    var brand = slide.querySelector(".kv__brand");
    var product = slide.querySelector(".kv__product");
    var tagline = slide.querySelector(".kv__tagline");

    /* brand: opacity/scale만 — x/y transform 사용 금지(중앙 정렬 유지) */
    gsap.to(brand, {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: "sine.out",
      clearProps: "transform",
    });

    gsap.to(product, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.15,
      delay: 0.06,
      ease: "sine.out",
    });

    gsap.to(tagline, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay: 0.18,
      ease: "sine.out",
    });
  }

  function goToSlide(index) {
    if (isAnimating || index === current || index < 0 || index >= total) {
      return;
    }

    isAnimating = true;
    current = index;
    prepareSlideContent(slides[current]);

    gsap.to(track, {
      xPercent: -((100 / total) * current),
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: function () {
        isAnimating = false;
      },
    });

    /* 슬라이드 이동과 겹쳐 부드럽게 등장 */
    gsap.delayedCall(0.35, function () {
      animateSlideContent(slides[current]);
    });

    setActiveDot(current);
    restartAuto();
  }

  function next() {
    goToSlide((current + 1) % total);
  }

  function prev() {
    goToSlide((current - 1 + total) % total);
  }

  function restartAuto() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
    }
    autoTimer = window.setInterval(next, AUTO_DELAY);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", next);
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", prev);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goToSlide(i);
    });
  });

  gsap.set(track, { xPercent: 0 });
  setActiveDot(0);
  prepareSlideContent(slides[0]);
  animateSlideContent(slides[0]);
  restartAuto();

  window.addEventListener("resize", function () {
    gsap.set(track, { xPercent: -((100 / total) * current) });
  });
})();

/**
 * Brand Story image slider
 * PC: 화살표 + 무한 루프
 * Tablet/Mobile: 스와이프 + 페이지네이션
 * 공통: 자동 재생 (수동 조작 시 타이머 리셋)
 */
(function () {
  "use strict";

  var story = document.querySelector(".story");
  if (!story || typeof gsap === "undefined") {
    return;
  }

  var viewport = story.querySelector(".story__viewport");
  var track = story.querySelector(".story__track");
  var prevBtn = story.querySelector("[data-story-prev]");
  var nextBtn = story.querySelector("[data-story-next]");
  var dots = story.querySelectorAll("[data-story-dot]");
  if (!track || !viewport) {
    return;
  }

  var originals = Array.prototype.slice.call(track.querySelectorAll(".story__slide"));
  var total = originals.length;
  if (!total) {
    return;
  }

  originals.forEach(function (slide) {
    track.appendChild(slide.cloneNode(true));
  });
  originals
    .slice()
    .reverse()
    .forEach(function (slide) {
      track.insertBefore(slide.cloneNode(true), track.firstChild);
    });

  var current = total;
  var isAnimating = false;
  var pointerId = null;
  var startX = 0;
  var startY = 0;
  var deltaX = 0;
  var axis = null;
  var dragBaseX = 0;
  var mq = window.matchMedia("(max-width: 63.9375rem)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var autoTimer = null;
  var AUTO_DELAY = 4500;

  function isMobileLayout() {
    return mq.matches;
  }

  function getStep() {
    var slide = track.querySelector(".story__slide");
    if (!slide) {
      return 0;
    }
    var styles = window.getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return slide.offsetWidth + gap;
  }

  function getActiveIndex() {
    return ((current % total) + total) % total;
  }

  function setActiveDot() {
    var active = getActiveIndex();
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  function normalizeLoop() {
    if (current >= total * 2) {
      current -= total;
      gsap.set(track, { x: -getStep() * current });
    } else if (current < total) {
      current += total;
      gsap.set(track, { x: -getStep() * current });
    }
  }

  function stopAuto() {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function restartAuto() {
    stopAuto();
    if (reduceMotion) {
      return;
    }
    autoTimer = window.setInterval(function () {
      if (!isAnimating) {
        move(1, true);
      }
    }, AUTO_DELAY);
  }

  function setPosition(immediate) {
    var x = -getStep() * current;
    if (immediate) {
      gsap.set(track, { x: x });
      setActiveDot();
      return;
    }

    gsap.to(track, {
      x: x,
      duration: 0.55,
      ease: "power2.out",
      onComplete: function () {
        normalizeLoop();
        isAnimating = false;
        setActiveDot();
      },
    });
  }

  function move(direction, fromAuto) {
    if (isAnimating) {
      return;
    }
    isAnimating = true;
    current += direction;
    setPosition(false);
    if (!fromAuto) {
      restartAuto();
    }
  }

  function goToOriginal(index) {
    if (isAnimating || index < 0 || index >= total) {
      return;
    }
    if (index === getActiveIndex()) {
      return;
    }
    isAnimating = true;
    current = total + index;
    setPosition(false);
    restartAuto();
  }

  function onPointerDown(event) {
    if (!isMobileLayout() || isAnimating) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    stopAuto();
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;
    axis = null;
    dragBaseX = -getStep() * current;

    if (viewport.setPointerCapture) {
      viewport.setPointerCapture(pointerId);
    }
  }

  function onPointerMove(event) {
    if (pointerId === null || event.pointerId !== pointerId || isAnimating) {
      return;
    }

    var dx = event.clientX - startX;
    var dy = event.clientY - startY;

    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        return;
      }
      axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis === "y") {
        pointerId = null;
        restartAuto();
        return;
      }
    }

    if (axis !== "x") {
      return;
    }

    deltaX = dx;
    if (event.cancelable) {
      event.preventDefault();
    }
    gsap.set(track, { x: dragBaseX + deltaX });
  }

  function onPointerUp(event) {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    var shouldSlide = axis === "x" && Math.abs(deltaX) > 40;
    pointerId = null;
    axis = null;

    if (shouldSlide) {
      move(deltaX < 0 ? 1 : -1);
    } else {
      isAnimating = true;
      setPosition(false);
      restartAuto();
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      move(1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      move(-1);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-story-dot"), 10);
      if (isNaN(index)) {
        return;
      }
      goToOriginal(index);
    });
  });

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove, { passive: false });
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);

  setPosition(true);
  restartAuto();

  window.addEventListener("resize", function () {
    gsap.set(track, { x: -getStep() * current });
    setActiveDot();
  });
})();

/**
 * Core value — Tablet/Mobile swipe + pagination
 * PC는 hover accordion 유지 (transform 미사용)
 */
(function () {
  "use strict";

  var core = document.querySelector(".core");
  if (!core || typeof gsap === "undefined") {
    return;
  }

  var viewport = core.querySelector(".core__viewport");
  var list = core.querySelector(".core__list");
  var items = Array.prototype.slice.call(core.querySelectorAll(".core__item"));
  var dots = core.querySelectorAll("[data-core-dot]");
  if (!viewport || !list || !items.length) {
    return;
  }

  var total = items.length;
  var current = 0;
  var isAnimating = false;
  var pointerId = null;
  var startX = 0;
  var startY = 0;
  var deltaX = 0;
  var axis = null;
  var dragBaseX = 0;
  var mq = window.matchMedia("(max-width: 63.9375rem)");

  function isMobileLayout() {
    return mq.matches;
  }

  function getStep() {
    return viewport.offsetWidth;
  }

  function syncItemWidths() {
    if (!isMobileLayout()) {
      items.forEach(function (item) {
        item.style.flex = "";
        item.style.width = "";
        item.style.minWidth = "";
        item.style.maxWidth = "";
      });
      return;
    }

    var w = getStep();
    items.forEach(function (item) {
      item.style.flex = "0 0 " + w + "px";
      item.style.width = w + "px";
      item.style.minWidth = w + "px";
      item.style.maxWidth = w + "px";
    });
  }

  function setActiveDot() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  function setPosition(immediate) {
    if (!isMobileLayout()) {
      gsap.set(list, { clearProps: "transform" });
      return;
    }

    var x = -getStep() * current;
    if (immediate) {
      gsap.set(list, { x: x });
      setActiveDot();
      return;
    }

    isAnimating = true;
    gsap.to(list, {
      x: x,
      duration: 0.55,
      ease: "power2.out",
      onComplete: function () {
        isAnimating = false;
        setActiveDot();
      },
    });
  }

  function move(direction) {
    if (!isMobileLayout() || isAnimating) {
      return;
    }
    var next = current + direction;
    if (next < 0 || next >= total) {
      isAnimating = true;
      setPosition(false);
      return;
    }
    current = next;
    setPosition(false);
  }

  function goTo(index) {
    if (!isMobileLayout() || isAnimating || index < 0 || index >= total || index === current) {
      return;
    }
    current = index;
    setPosition(false);
  }

  function onPointerDown(event) {
    if (!isMobileLayout() || isAnimating) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;
    axis = null;
    dragBaseX = -getStep() * current;

    if (viewport.setPointerCapture) {
      viewport.setPointerCapture(pointerId);
    }
  }

  function onPointerMove(event) {
    if (pointerId === null || event.pointerId !== pointerId || isAnimating) {
      return;
    }

    var dx = event.clientX - startX;
    var dy = event.clientY - startY;

    if (!axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        return;
      }
      axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis === "y") {
        pointerId = null;
        return;
      }
    }

    if (axis !== "x") {
      return;
    }

    deltaX = dx;
    if (event.cancelable) {
      event.preventDefault();
    }

    var resist = 1;
    if ((current === 0 && deltaX > 0) || (current === total - 1 && deltaX < 0)) {
      resist = 0.35;
    }
    gsap.set(list, { x: dragBaseX + deltaX * resist });
  }

  function onPointerUp(event) {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    var shouldSlide = axis === "x" && Math.abs(deltaX) > 40;
    pointerId = null;
    axis = null;

    if (shouldSlide) {
      move(deltaX < 0 ? 1 : -1);
    } else {
      isAnimating = true;
      setPosition(false);
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = parseInt(dot.getAttribute("data-core-dot"), 10);
      if (isNaN(index)) {
        return;
      }
      goTo(index);
    });
  });

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove, { passive: false });
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);

  function onBreakpointChange() {
    syncItemWidths();
    if (isMobileLayout()) {
      setPosition(true);
    } else {
      current = 0;
      gsap.set(list, { clearProps: "transform" });
      setActiveDot();
    }
  }

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onBreakpointChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onBreakpointChange);
  }

  window.addEventListener("resize", function () {
    if (!isMobileLayout()) {
      return;
    }
    syncItemWidths();
    gsap.set(list, { x: -getStep() * current });
  });

  onBreakpointChange();
})();

/**
 * Open Market — online / offline toggle
 */
(function () {
  "use strict";

  var market = document.querySelector(".market");
  if (!market) {
    return;
  }

  var tabs = market.querySelectorAll("[data-market-tab]");
  var panels = market.querySelectorAll("[data-market-panel]");
  if (!tabs.length || !panels.length) {
    return;
  }

  function activate(id) {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-market-tab") === id;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach(function (panel) {
      var isActive = panel.getAttribute("data-market-panel") === id;
      panel.classList.toggle("is-active", isActive);
      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-market-tab");
      if (!id) {
        return;
      }
      activate(id);
    });
  });
})();


