/**
 * Brand Story — Lenis + sequential scroll animations (한 섹션 · 차례 재생)
 * 1) 슬로건 falling → 2) 본문 reveal → 3) 이미지 zoom
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var section = document.querySelector(".brand-intro");
  var sloganEl = document.querySelector(".falling-title");
  var textEl = document.querySelector(".reveal-type");
  var mediaEl = document.querySelector(".brand-intro__media");

  function showFallback() {
    if (sloganEl) {
      sloganEl.classList.add("is-split", "is-ready");
    }
    if (mediaEl) {
      mediaEl.classList.add("is-ready");
    }
  }

  if (
    !section ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    typeof SplitType === "undefined"
  ) {
    showFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Lenis */
  if (!reduceMotion && typeof Lenis !== "undefined") {
    var lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* AOS — Lenis와 함께 쓰므로 ScrollTrigger로 진입 시점을 맞춤 */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 120,
      disable: reduceMotion,
    });

    if (!reduceMotion) {
      gsap.utils.toArray("[data-aos]").forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
          onEnter: function () {
            el.classList.add("aos-animate");
          },
        });
      });
    }
  }

  if (reduceMotion) {
    showFallback();
    return;
  }

  /* --- 슬로건 Split --- */
  var sloganInners = [];
  if (sloganEl) {
    var sloganSplit = new SplitType(sloganEl, {
      types: "words, chars",
      wordClass: "word",
      charClass: "char",
    });
    sloganEl.classList.add("is-split");

    if (sloganSplit.chars && sloganSplit.chars.length) {
      sloganSplit.chars.forEach(function (char) {
        var inner = document.createElement("span");
        inner.className = "char-inner";
        while (char.firstChild) {
          inner.appendChild(char.firstChild);
        }
        char.appendChild(inner);
        sloganInners.push(inner);
      });
      gsap.set(sloganInners, { yPercent: -120, opacity: 0 });
    }
    sloganEl.classList.add("is-ready");
  }

  /* --- 본문 Split --- */
  var textChars = [];
  var textFg = "#40594a";
  if (textEl) {
    textFg = window.getComputedStyle(textEl).color || textFg;
    var textSplit = new SplitType(textEl, { types: "chars" });
    if (textSplit.chars && textSplit.chars.length) {
      textChars = textSplit.chars;
      gsap.set(textChars, { color: "#cccccc" });
    }
  }

  /* --- 이미지 --- */
  if (mediaEl) {
    gsap.set(mediaEl, { scale: 0.85, opacity: 0 });
    mediaEl.classList.add("is-ready");
  }

  /* --------------------------------------------------------------------------
     스크롤 타임라인 — 동시에 나오지 않고 구간별로 차례 재생
     조절: start/end, 각 add 위치(0 / 0.35 / 0.7), duration·stagger
     -------------------------------------------------------------------------- */
  var tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      end: "bottom 55%",
      scrub: 0.8,
      markers: false,
    },
  });

  /* 1) 슬로건 falling */
  if (sloganInners.length) {
    tl.to(
      sloganInners,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.012,
        ease: "power3.out",
      },
      0
    );
  }

  /* 2) 본문 색상 reveal — 슬로건 이후 */
  if (textChars.length) {
    tl.to(
      textChars,
      {
        color: textFg,
        duration: 0.35,
        stagger: 0.008,
        ease: "none",
      },
      0.35
    );
  }

  /* 3) 이미지 zoom — 본문 이후 */
  if (mediaEl) {
    tl.to(
      mediaEl,
      {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      0.7
    );
  }

  function refreshTriggers() {
    ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshTriggers);
  }
  window.addEventListener("load", refreshTriggers);
  window.addEventListener("resize", function () {
    window.clearTimeout(window.__brandRevealResizeTimer);
    window.__brandRevealResizeTimer = window.setTimeout(refreshTriggers, 150);
  });
})();

/* Brand features — 태블릿/모바일 마우스 드래그 슬라이드 */
(function () {
  "use strict";

  var list = document.querySelector(".brand-features__list");
  var trackLine = document.querySelector(".brand-feature__line--track");
  if (!list) {
    return;
  }

  var mq = window.matchMedia("(max-width: 63.9375rem)");
  var active = false;
  var dragging = false;
  var startX = 0;
  var startScroll = 0;
  var pointerId = null;

  function slideCount() {
    return list.querySelectorAll(".brand-feature").length;
  }

  function slideWidth() {
    return list.clientWidth;
  }

  function clampIndex(index) {
    var max = Math.max(0, slideCount() - 1);
    return Math.max(0, Math.min(max, index));
  }

  function setTrackActive(value, withTransition) {
    if (!trackLine) {
      return;
    }
    if (withTransition) {
      trackLine.classList.remove("is-dragging");
    } else {
      trackLine.classList.add("is-dragging");
    }
    trackLine.style.setProperty("--active", String(value));
  }

  function syncTrackFromScroll(withTransition) {
    var width = slideWidth();
    if (!width) {
      return;
    }
    var progress = list.scrollLeft / width;
    var max = Math.max(0, slideCount() - 1);
    setTrackActive(Math.max(0, Math.min(max, progress)), withTransition);
  }

  function goTo(index, smooth) {
    var next = clampIndex(index);
    var left = next * slideWidth();
    setTrackActive(next, true);
    if (typeof list.scrollTo === "function") {
      list.scrollTo({ left: left, behavior: smooth ? "smooth" : "auto" });
    } else {
      list.scrollLeft = left;
    }
  }

  function onPointerDown(event) {
    if (!mq.matches || event.button !== 0) {
      return;
    }

    active = true;
    dragging = false;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScroll = list.scrollLeft;
    list.classList.add("is-dragging");
    if (trackLine) {
      trackLine.classList.add("is-dragging");
    }

    if (list.setPointerCapture) {
      list.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event) {
    if (!active || event.pointerId !== pointerId) {
      return;
    }

    var dx = event.clientX - startX;
    if (Math.abs(dx) > 4) {
      dragging = true;
    }

    list.scrollLeft = startScroll - dx;
    syncTrackFromScroll(false);
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!active || event.pointerId !== pointerId) {
      return;
    }

    active = false;
    list.classList.remove("is-dragging");

    if (list.releasePointerCapture && list.hasPointerCapture(pointerId)) {
      list.releasePointerCapture(pointerId);
    }
    pointerId = null;

    if (!mq.matches) {
      return;
    }

    var width = slideWidth();
    if (!width) {
      return;
    }

    var startIndex = Math.round(startScroll / width);
    var dx = event.clientX - startX;
    var threshold = Math.min(80, width * 0.18);
    var nextIndex = startIndex;

    if (dragging && Math.abs(dx) > threshold) {
      nextIndex = dx < 0 ? startIndex + 1 : startIndex - 1;
    } else {
      nextIndex = Math.round(list.scrollLeft / width);
    }

    goTo(nextIndex, true);
  }

  list.addEventListener("pointerdown", onPointerDown);
  list.addEventListener("pointermove", onPointerMove, { passive: false });
  list.addEventListener("pointerup", onPointerUp);
  list.addEventListener("pointercancel", onPointerUp);
  list.addEventListener(
    "scroll",
    function () {
      if (!mq.matches || active) {
        return;
      }
      syncTrackFromScroll(true);
    },
    { passive: true }
  );

  list.addEventListener(
    "click",
    function (event) {
      if (dragging) {
        event.preventDefault();
        event.stopPropagation();
        dragging = false;
      }
    },
    true
  );

  window.addEventListener("resize", function () {
    if (!mq.matches) {
      list.classList.remove("is-dragging");
      if (trackLine) {
        trackLine.classList.remove("is-dragging");
      }
      active = false;
      return;
    }
    var width = slideWidth();
    if (!width) {
      return;
    }
    goTo(Math.round(list.scrollLeft / width), false);
  });

  syncTrackFromScroll(false);
})();
