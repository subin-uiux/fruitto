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

  function animateSlideContent(slide) {
    var brand = slide.querySelector(".kv__brand");
    var product = slide.querySelector(".kv__product");
    var tagline = slide.querySelector(".kv__tagline");

    /* brand: opacity/scale만 — x/y transform 사용 금지(중앙 정렬 유지) */
    gsap.fromTo(
      brand,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "transform",
      }
    );

    gsap.fromTo(
      product,
      { opacity: 0, y: 60, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        delay: 0.08,
        ease: "power3.out",
      }
    );

    gsap.fromTo(
      tagline,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: 0.28,
        ease: "power2.out",
      }
    );
  }

  function goToSlide(index) {
    if (isAnimating || index === current || index < 0 || index >= total) {
      return;
    }

    isAnimating = true;
    current = index;

    gsap.to(track, {
      xPercent: -((100 / total) * current),
      duration: 0.85,
      ease: "power2.inOut",
      onComplete: function () {
        isAnimating = false;
        animateSlideContent(slides[current]);
      },
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

  // 앞뒤로 복제해 seamless loop
  originals.forEach(function (slide) {
    track.appendChild(slide.cloneNode(true));
  });
  originals
    .slice()
    .reverse()
    .forEach(function (slide) {
      track.insertBefore(slide.cloneNode(true), track.firstChild);
    });

  // [clones][originals][clones] → 원본 첫 장에서 시작
  var current = total;
  var isAnimating = false;
  var touchStartX = 0;
  var touchDeltaX = 0;
  var isTouching = false;

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
    var index = ((current % total) + total) % total;
    return index;
  }

  function setActiveDot() {
    var active = getActiveIndex();
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
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
      duration: 0.7,
      ease: "power2.inOut",
      onComplete: function () {
        if (current >= total * 2) {
          current -= total;
          gsap.set(track, { x: -getStep() * current });
        } else if (current < total) {
          current += total;
          gsap.set(track, { x: -getStep() * current });
        }
        isAnimating = false;
        setActiveDot();
      },
    });
  }

  function move(direction) {
    if (isAnimating) {
      return;
    }
    isAnimating = true;
    current += direction;
    setPosition(false);
  }

  function goToOriginal(index) {
    if (isAnimating || index < 0 || index >= total) {
      return;
    }
    var active = getActiveIndex();
    if (index === active) {
      return;
    }
    isAnimating = true;
    current = total + index;
    setPosition(false);
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

  viewport.addEventListener(
    "touchstart",
    function (event) {
      if (!event.touches || !event.touches.length) {
        return;
      }
      isTouching = true;
      touchStartX = event.touches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (event) {
      if (!isTouching || !event.touches || !event.touches.length) {
        return;
      }
      touchDeltaX = event.touches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchend",
    function () {
      if (!isTouching) {
        return;
      }
      isTouching = false;
      if (Math.abs(touchDeltaX) < 40) {
        return;
      }
      if (touchDeltaX < 0) {
        move(1);
      } else {
        move(-1);
      }
    },
    { passive: true }
  );

  setPosition(true);

  window.addEventListener("resize", function () {
    gsap.set(track, { x: -getStep() * current });
    setActiveDot();
  });
})();
