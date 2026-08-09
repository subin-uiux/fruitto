/**
 * Product page — tab switching · product popup content
 */
(function () {
  "use strict";

  var tabs = document.querySelectorAll("[data-product-tab]");
  var panels = document.querySelectorAll("[data-product-panel]");
  var titleEl = document.querySelector("[data-product-title]");

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

  if (tabs.length) {
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

    function syncFromHash() {
      var hash = (location.hash || "#all").replace(/^#/, "");
      var valid = Array.prototype.some.call(tabs, function (tab) {
        return tab.getAttribute("data-product-tab") === hash;
      });
      activate(valid ? hash : "all");
    }

    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
  }

  /* --------------------------------------------------------------------------
     Product popup — 공통 + 제품별 데이터
     -------------------------------------------------------------------------- */
  var COMMON = {
    note: "*계절과 수급 상황에 따라 일부 원료의 산지는 변경될 수 있습니다.",
    sectionTitle: "영양성분",
    sectionSub: "* 100g당 영양정보",
    price: "파인트(434g) ₩7,200 | 미니컵(100g) ₩3,600",
    weight: "100g",
    originTitle: "원산지",
    allergyTitle: "알레르기",
  };

  var PRODUCTS = {
    kiwi: {
      title: "키위 젤라또 상세정보",
      calorie: "132kcal",
      sugar: "20g",
      protein: "2.6g",
      fat: "2.0g",
      sodium: "46mg",
      origin: "키위 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 키위 알레르기 ∙ 라텍스 민감자 주의",
    },
    strawberry: {
      title: "딸기 젤라또 상세정보",
      calorie: "138kcal",
      sugar: "21g",
      protein: "2.8g",
      fat: "2.2g",
      sodium: "48mg",
      origin: "딸기 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 딸기 ∙ 베리류 민감자 주의",
    },
    banana: {
      title: "바나나 젤라또 상세정보",
      calorie: "135kcal",
      sugar: "22g",
      protein: "3.1g",
      fat: "2.4g",
      sodium: "52mg",
      origin: "바나나 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 바나나 ∙ 라텍스 민감자 주의",
    },
    lemon: {
      title: "레몬 젤라또 상세정보",
      calorie: "139kcal",
      sugar: "27g",
      protein: "2.6g",
      fat: "2.1g",
      sodium: "48mg",
      origin: "레몬 - 미국산 또는 스페인산 / 원유- 국산",
      allergy: "우유, 대두함유 / 감귤류 민감자 주의",
    },
    greenplum: {
      title: "매실 젤라또 상세정보",
      calorie: "136kcal",
      sugar: "20g",
      protein: "2.4g",
      fat: "2.0g",
      sodium: "45mg",
      origin: "매실 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 장미과 과일 민감자 주의",
    },
    cheonhyehyang: {
      title: "천혜향 젤라또 상세정보",
      calorie: "139kcal",
      sugar: "20g",
      protein: "2.2g",
      fat: "2.0g",
      sodium: "48mg",
      origin: "천혜향 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 감귤류 민감자 주의",
    },
    peach: {
      title: "복숭아 젤라또 상세정보",
      calorie: "140kcal",
      sugar: "22g",
      protein: "2.6g",
      fat: "2.0g",
      sodium: "48mg",
      origin: "복숭아 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 복숭아 알레르기 주의",
    },
    watermelon: {
      title: "수박 젤라또 상세정보",
      calorie: "118kcal",
      sugar: "19g",
      protein: "2.1g",
      fat: "1.6g",
      sodium: "38mg",
      origin: "수박 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 수박 · 참외 · 멜론 등 박과류 민감자 주의",
    },
    melon: {
      title: "멜론 젤라또 상세정보",
      calorie: "139kcal",
      sugar: "21g",
      protein: "2.8g",
      fat: "2.0g",
      sodium: "49mg",
      origin: "멜론 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 수박 · 참외 · 멜론 등 박과류 민감자 주의",
    },
    mango: {
      title: "망고 젤라또 상세정보",
      calorie: "145kcal",
      sugar: "23g",
      protein: "2.7g",
      fat: "2.1g",
      sodium: "44mg",
      origin: "망고 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 망고 및 옻나무 과일 민감자 주의",
    },
    pomegranate: {
      title: "석류 젤라또 상세정보",
      calorie: "134kcal",
      sugar: "22g",
      protein: "2.3g",
      fat: "1.8g",
      sodium: "40mg",
      origin: "석류 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 석류 민감자 주의",
    },
    apple: {
      title: "사과 젤라또 상세정보",
      calorie: "130kcal",
      sugar: "21g",
      protein: "2.4g",
      fat: "1.9g",
      sodium: "42mg",
      origin: "사과 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 사과 ∙ 장미과 과일 민감자 주의",
    },
    grape: {
      title: "포도 젤라또 상세정보",
      calorie: "136kcal",
      sugar: "22g",
      protein: "2.5g",
      fat: "2.9g",
      sodium: "43mg",
      origin: "포도 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 포도류 민감자 주의",
    },
    yuja: {
      title: "유자 젤라또 상세정보",
      calorie: "128kcal",
      sugar: "20g",
      protein: "2.3g",
      fat: "1.8g",
      sodium: "41mg",
      origin: "유자 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 감귤류 및 유자껍질향 성분 민감자 주의",
    },
    mandarin: {
      title: "귤 젤라또 상세정보",
      calorie: "126kcal",
      sugar: "20g",
      protein: "2.4g",
      fat: "1.8g",
      sodium: "42mg",
      origin: "귤 - 국산 / 원유- 국산",
      allergy: "우유, 대두함유 / 감귤류 민감자 주의",
    },
  };

  var PRODUCT_KEYS = Object.keys(PRODUCTS);

  function resolveProductKey(group) {
    if (!group) {
      return null;
    }
    var i;
    var key;
    for (i = 0; i < PRODUCT_KEYS.length; i += 1) {
      key = PRODUCT_KEYS[i];
      if (group.classList.contains(key) || group.classList.contains(key.charAt(0).toUpperCase() + key.slice(1))) {
        return key;
      }
    }
    /* Pomegranate 대문자 클래스 대응 */
    if (group.classList.contains("Pomegranate")) {
      return "pomegranate";
    }
    return null;
  }

  function fillPopup(productKey) {
    var data = PRODUCTS[productKey];
    if (!data) {
      return;
    }
    var popup = document.querySelector("#product-popup .product-popup");
    if (!popup) {
      return;
    }

    var setText = function (selector, value) {
      var el = popup.querySelector(selector);
      if (el) {
        el.textContent = value;
      }
    };

    setText("[data-popup-title]", data.title);
    setText("[data-popup-note]", COMMON.note);
    setText("[data-popup-section-title]", COMMON.sectionTitle);
    setText("[data-popup-section-sub]", COMMON.sectionSub);
    setText("[data-popup-price]", COMMON.price);
    setText("[data-popup-weight]", COMMON.weight);
    setText("[data-popup-calorie]", data.calorie);
    setText("[data-popup-sugar]", data.sugar);
    setText("[data-popup-protein]", data.protein);
    setText("[data-popup-fat]", data.fat);
    setText("[data-popup-sodium]", data.sodium);
    setText("[data-popup-origin-title]", COMMON.originTitle);
    setText("[data-popup-origin]", data.origin);
    setText("[data-popup-allergy-title]", COMMON.allergyTitle);
    setText("[data-popup-allergy]", data.allergy);
  }

  document.querySelectorAll("[data-popup-open='product-popup']").forEach(function (btn) {
    btn.addEventListener(
      "click",
      function () {
        var group = btn.closest(".product-card-group");
        var key = resolveProductKey(group);
        if (key) {
          fillPopup(key);
        }
      },
      true
    );
  });
})();
