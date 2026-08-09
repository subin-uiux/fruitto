/**
 * Contact page — tab switching, FAQ accordion, Kakao map, inquiry form
 */
(function () {
  "use strict";

  var tabs = document.querySelectorAll("[data-contact-tab]");
  var panels = document.querySelectorAll("[data-contact-panel]");
  var titleEl = document.querySelector("[data-contact-title]");
  var items = document.querySelectorAll(".notice-list--faq .notice-item");
  var mapEl = document.getElementById("kakao-map");
  var mapReady = false;
  var mapInstance = null;

  var titleMap = {
    faq: "자주하는 질문",
    inquiry: "",
  };

  /* 오시는 길 — 위도 37.4959528 / 경도 127.029101 */
  var MAP_LAT = 37.4959528;
  var MAP_LNG = 127.029101;

  function activate(id) {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-contact-tab") === id;
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
        panel.getAttribute("data-contact-panel") === id
      );
    });

    if (titleEl) {
      var title = titleMap[id] || "";
      titleEl.textContent = title;
      titleEl.classList.toggle("is-hidden", !title);
    }

    if (id === "inquiry") {
      window.setTimeout(initKakaoMap, 50);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      var id = tab.getAttribute("data-contact-tab");
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

  /* File name display + 5MB limit */
  var fileInput = document.querySelector("[data-inquiry-file]");
  var fileNameEl = document.querySelector("[data-inquiry-file-name]");
  if (fileInput && fileNameEl) {
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) {
        fileNameEl.textContent = "파일첨부시 용량은 5m를 넘길 수 없습니다.";
        fileNameEl.classList.remove("is-selected");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        window.alert("파일 용량은 5MB를 넘길 수 없습니다.");
        fileInput.value = "";
        fileNameEl.textContent = "파일첨부시 용량은 5m를 넘길 수 없습니다.";
        fileNameEl.classList.remove("is-selected");
        return;
      }
      fileNameEl.textContent = file.name;
      fileNameEl.classList.add("is-selected");
    });
  }

  /* Inquiry submit — validate · prevent duplicate · success message */
  var inquiryForm = document.querySelector("[data-inquiry-form]");
  var submitBtn = document.querySelector("[data-inquiry-submit]");
  var messageEl = document.querySelector("[data-inquiry-message]");
  var isSubmitting = false;

  function showMessage(text, isError) {
    if (!messageEl) {
      return;
    }
    messageEl.hidden = false;
    messageEl.textContent = text;
    messageEl.classList.toggle("is-error", !!isError);
  }

  function hideMessage() {
    if (!messageEl) {
      return;
    }
    messageEl.hidden = true;
    messageEl.textContent = "";
    messageEl.classList.remove("is-error");
  }

  function validateInquiryForm(form) {
    var company = form.elements.namedItem("company");
    var manager = form.elements.namedItem("manager");
    var address = form.elements.namedItem("address");
    var title = form.elements.namedItem("title");
    var detail = form.elements.namedItem("detail");
    var type = form.querySelector('input[name="inquiry-type"]:checked');
    var channel = form.querySelector('input[name="sales-channel"]:checked');

    if (!type) {
      return "접수 유형을 선택해주세요.";
    }
    if (!channel) {
      return "판매 채널을 선택해주세요.";
    }
    if (!company || !String(company.value).trim()) {
      return "업체명을 입력해주세요.";
    }
    if (!manager || !String(manager.value).trim()) {
      return "담당자 명을 입력해주세요.";
    }
    if (!address || !String(address.value).trim()) {
      return "주소를 입력해주세요.";
    }
    if (!title || !String(title.value).trim()) {
      return "제목을 입력해주세요.";
    }
    if (!detail || !String(detail.value).trim()) {
      return "상세내용을 입력해주세요.";
    }
    return "";
  }

  if (inquiryForm && submitBtn) {
    inquiryForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }

      hideMessage();
      var error = validateInquiryForm(inquiryForm);
      if (error) {
        showMessage(error, true);
        return;
      }

      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      showMessage("문의 내용을 등록하는 중입니다…", false);

      /* 서버 연동 전 로컬 등록 시뮬레이션 */
      window.setTimeout(function () {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        showMessage("문의 접수가 완료되었습니다. 담당자가 확인 후 연락드리겠습니다.", false);
        inquiryForm.reset();
        if (fileNameEl) {
          fileNameEl.textContent = "파일첨부시 용량은 5m를 넘길 수 없습니다.";
          fileNameEl.classList.remove("is-selected");
        }
      }, 800);
    });
  }

  function createMap() {
    if (!mapEl || typeof kakao === "undefined" || !kakao.maps) {
      return;
    }

    var coords = new kakao.maps.LatLng(MAP_LAT, MAP_LNG);
    var mapOption = {
      center: coords,
      level: 3,
    };

    mapInstance = new kakao.maps.Map(mapEl, mapOption);

    var marker = new kakao.maps.Marker({
      position: coords,
    });
    marker.setMap(mapInstance);

    mapReady = true;

    /* 숨김 탭에서 생성 시 크기 재계산 */
    window.setTimeout(function () {
      if (mapInstance) {
        mapInstance.relayout();
        mapInstance.setCenter(coords);
      }
    }, 100);
  }

  function showMapError(message) {
    if (!mapEl) {
      return;
    }
    mapEl.innerHTML =
      '<p style="display:flex;align-items:center;justify-content:center;height:100%;margin:0;padding:1rem;text-align:center;color:#555;font-size:0.875rem;line-height:1.5;">' +
      message +
      "</p>";
  }

  function initKakaoMap(retryCount) {
    var retries = typeof retryCount === "number" ? retryCount : 0;

    if (!mapEl || mapReady) {
      if (mapInstance) {
        window.setTimeout(function () {
          mapInstance.relayout();
        }, 100);
      }
      return;
    }

    if (window.__kakaoMapSdkFailed) {
      showMapError(
        "카카오맵 SDK를 불러오지 못했습니다.<br />현재 주소창 도메인이<br />카카오 JavaScript SDK 도메인에<br />등록돼 있는지 확인해 주세요.<br />(예: http://127.0.0.1:5503)"
      );
      return;
    }

    if (typeof kakao === "undefined" || !kakao.maps) {
      if (retries < 20) {
        window.setTimeout(function () {
          initKakaoMap(retries + 1);
        }, 100);
        return;
      }
      showMapError(
        "지도를 불러오지 못했습니다.<br />브라우저 주소가 등록한 도메인과<br />일치하는지 확인해 주세요.<br />(예: http://127.0.0.1:5503)"
      );
      return;
    }

    kakao.maps.load(createMap);
  }

  function syncFromHash() {
    var hash = (location.hash || "#faq").replace(/^#/, "");
    var valid = Array.prototype.some.call(tabs, function (tab) {
      return tab.getAttribute("data-contact-tab") === hash;
    });
    activate(valid ? hash : "faq");
  }

  window.addEventListener("hashchange", syncFromHash);
  syncFromHash();
})();
