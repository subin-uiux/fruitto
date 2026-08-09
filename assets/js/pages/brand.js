/**
 * Brand Story — Lenis + sequential scroll animations (한 섹션 · 차례 재생)
 * 1) 슬로건 falling → 2) 본문 reveal → 3) 이미지 blur → clear
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
      touchMultiplier: 1.2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    /* lagSmoothing(0)은 무거운 페인트 직후 스크롤이 튀며 버벅임 — 기본값 유지 */
  }

  /* AOS — 한 번만 재생 (mirror/재토글은 섹션 경계에서 스크롤 버벅임 유발) */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
      offset: 120,
      disable: reduceMotion,
      disableMutationObserver: true,
    });

    if (!reduceMotion) {
      gsap.utils.toArray("[data-aos]").forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
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

  /* --- 이미지: 본문 리빌 후 blur → clear · 스크롤 업/다운 시 재재생 --- */
  if (mediaEl) {
    gsap.set(mediaEl, { opacity: 0, filter: "blur(24px)" });
    mediaEl.classList.add("is-ready");
  }

  var mediaRevealed = false;

  function resetMediaReveal() {
    if (!mediaEl) {
      return;
    }
    mediaRevealed = false;
    gsap.killTweensOf(mediaEl);
    gsap.set(mediaEl, { opacity: 0, filter: "blur(24px)" });
  }

  function playMediaReveal() {
    if (!mediaEl || mediaRevealed) {
      return;
    }
    mediaRevealed = true;
    gsap.fromTo(
      mediaEl,
      { opacity: 0, filter: "blur(24px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.1,
        ease: "power2.out",
        overwrite: true,
      }
    );
  }

  /* --------------------------------------------------------------------------
     스크롤 타임라인 — 슬로건 → 본문
     brand-intro__text 리빌이 끝나면 이미지 blur → clear
     -------------------------------------------------------------------------- */
  var tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      end: "center 35%",
      scrub: 0.5,
      markers: false,
      onUpdate: function (self) {
        if (self.progress >= 0.45) {
          playMediaReveal();
        } else if (mediaRevealed) {
          resetMediaReveal();
        }
      },
      onLeaveBack: resetMediaReveal,
    },
  });

  /* 1) 슬로건 falling */
  if (sloganInners.length) {
    tl.to(
      sloganInners,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.25,
        stagger: 0.01,
        ease: "power3.out",
      },
      0
    );
  }

  /* 2) 본문 색상 reveal */
  if (textChars.length) {
    tl.to(
      textChars,
      {
        color: textFg,
        duration: 0.55,
        stagger: 0.005,
        ease: "none",
      },
      0.2
    );
  }

  /* 첫 화면: 서브비주얼 아래 남은 뷰포트만큼 패드로 채워 intro가 보이지 않게 */
  function updateIntroPad() {
    var pad = document.querySelector(".brand-intro-pad");
    var subVisual = document.querySelector(".sub-visual");
    if (!pad || !subVisual) {
      return;
    }
    var remaining = Math.max(0, window.innerHeight - subVisual.offsetHeight);
    pad.style.height = remaining + "px";
  }

  function refreshTriggers() {
    updateIntroPad();
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
  updateIntroPad();
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
  var axis = null; // "x" | "y"
  var startX = 0;
  var startY = 0;
  var startScroll = 0;
  var pointerId = null;
  var rafId = 0;
  var pendingScrollLeft = null;

  /* 태블릿/모바일에서만 Lenis 가로 제스처 충돌 방지 (PC는 세로 스크롤 끊김 방지) */
  function syncLenisPrevent() {
    if (mq.matches) {
      list.setAttribute("data-lenis-prevent", "");
    } else {
      list.removeAttribute("data-lenis-prevent");
    }
  }

  syncLenisPrevent();

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

  function flushScroll() {
    rafId = 0;
    if (pendingScrollLeft === null) {
      return;
    }
    list.scrollLeft = pendingScrollLeft;
    pendingScrollLeft = null;
    syncTrackFromScroll(false);
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
    axis = null;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startScroll = list.scrollLeft;
  }

  function onPointerMove(event) {
    if (!active || event.pointerId !== pointerId) {
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
        /* 세로 스크롤은 Lenis/브라우저에 맡김 */
        active = false;
        pointerId = null;
        return;
      }

      dragging = true;
      list.classList.add("is-dragging");
      if (trackLine) {
        trackLine.classList.add("is-dragging");
      }
      if (list.setPointerCapture) {
        list.setPointerCapture(event.pointerId);
      }
    }

    if (axis !== "x") {
      return;
    }

    pendingScrollLeft = startScroll - dx;
    if (!rafId) {
      rafId = window.requestAnimationFrame(flushScroll);
    }
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (pointerId === null || event.pointerId !== pointerId) {
      return;
    }

    var wasDragging = dragging && axis === "x";
    active = false;
    list.classList.remove("is-dragging");

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
      flushScroll();
    }

    if (list.releasePointerCapture && list.hasPointerCapture(pointerId)) {
      list.releasePointerCapture(pointerId);
    }
    pointerId = null;
    axis = null;

    if (!mq.matches || !wasDragging) {
      dragging = false;
      return;
    }

    var width = slideWidth();
    if (!width) {
      dragging = false;
      return;
    }

    var startIndex = Math.round(startScroll / width);
    var dx = event.clientX - startX;
    var threshold = Math.min(80, width * 0.18);
    var nextIndex = startIndex;

    if (Math.abs(dx) > threshold) {
      nextIndex = dx < 0 ? startIndex + 1 : startIndex - 1;
    } else {
      nextIndex = Math.round(list.scrollLeft / width);
    }

    goTo(nextIndex, true);
    dragging = false;
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
    syncLenisPrevent();
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

/* 특징 → 못생긴 과일 경계: 이미지 선디코드로 진입 시 페인트 버벅임 완화 */
(function () {
  "use strict";

  var features = document.querySelector(".brand-features");
  var image = document.querySelector(".ugly-fruit__image");
  if (!features || !image || typeof IntersectionObserver === "undefined") {
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      if (!entries.some(function (entry) {
        return entry.isIntersecting;
      })) {
        return;
      }
      var preload = new Image();
      preload.decoding = "async";
      preload.src = image.currentSrc || image.src;
      if (preload.decode) {
        preload.decode().catch(function () {});
      }
      observer.disconnect();
    },
    { rootMargin: "120% 0px" }
  );

  observer.observe(features);
})();
