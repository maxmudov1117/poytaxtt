/* ==========================================================================
   Poytaxt Taxi - booking and feedback forms
   Extracted from index.html so the page can drop script-src 'unsafe-inline'.
   Element ids are unchanged on purpose: they are the contract with the
   backend payload and with anything measuring the funnel.
   ========================================================================== */
(function () {
  'use strict';

  var ENDPOINT = '/api/form';

  /* --- shared validation ------------------------------------------------ */

  function escapeText(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidName(name) {
    return name.length >= 2 && /^[a-zA-Zа-яА-ЯёЁ\s'‘’ʻ`-]+$/.test(name);
  }

  function isValidPhone(phone) {
    var clean = phone.replace(/[^\d+]/g, '');
    return /^(?:\+?998)?\d{9}$/.test(clean);
  }

  function t(key, fallback) {
    if (window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key) || fallback;
    }
    return fallback;
  }

  function futureDateTimeMessage() {
    return t('alert.past_datetime', 'Iltimos, kelajakdagi sana va vaqtni tanlang.');
  }

  function send(payload, okKey, failKey, onSuccess) {
    if (!navigator.onLine) {
      window.showAlert(t(failKey, 'Xatolik yuz berdi.'), 'error');
      return;
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(function (data) {
        if (!data || data.ok !== true) throw new Error('Request rejected');
        window.showAlert(t(okKey, 'Yuborildi.'), 'success');
        if (onSuccess) onSuccess();
      })
      .catch(function () {
        window.showAlert(t(failKey, 'Xatolik yuz berdi.'), 'error');
      });
  }

  /* --- region / district cascade ---------------------------------------
     Both directions read from the same i18n dataset the route board uses. */

  function getRegions() {
    return window.i18n.regionKeys.map(function (key) {
      return { value: key, label: window.i18n.t('region.' + key) };
    });
  }

  function populateFromRegions() {
    var fromSelect = document.getElementById('fromRegion');
    if (!fromSelect) return;

    var current = fromSelect.value;
    fromSelect.innerHTML = '';
    fromSelect.appendChild(new Option(window.i18n.t('form.from_region'), ''));

    getRegions().forEach(function (r) {
      fromSelect.appendChild(new Option(r.label, r.value));
    });

    if (current) fromSelect.value = current;
  }

  function updateToRegionOptions() {
    var fromSelect = document.getElementById('fromRegion');
    var toSelect = document.getElementById('toRegion');
    if (!fromSelect || !toSelect) return;

    var fromValue = fromSelect.value;
    var currentTo = toSelect.value;

    toSelect.innerHTML = '';
    toSelect.appendChild(new Option(window.i18n.t('form.to_region'), ''));

    getRegions().forEach(function (r) {
      if (r.value !== fromValue) toSelect.appendChild(new Option(r.label, r.value));
    });

    if (currentTo && currentTo !== fromValue) {
      toSelect.value = currentTo;
    } else {
      updateDistricts('toRegion', 'toDistrict');
    }
  }

  function updateDistricts(regionSelectId, districtSelectId) {
    var regionSelect = document.getElementById(regionSelectId);
    var districtSelect = document.getElementById(districtSelectId);
    if (!regionSelect || !districtSelect) return;

    var region = regionSelect.value;
    var current = districtSelect.value;
    var keys = window.i18n.districtKeys[region] || [];

    districtSelect.innerHTML = '';
    districtSelect.appendChild(new Option(window.i18n.t('form.district_select'), ''));

    keys.forEach(function (key) {
      districtSelect.appendChild(new Option(window.i18n.t('district.' + key), key));
    });

    districtSelect.value = keys.indexOf(current) !== -1 ? current : '';
  }

  function initRegionCascade() {
    var fromRegionEl = document.getElementById('fromRegion');
    var toRegionEl = document.getElementById('toRegion');
    if (!fromRegionEl || !toRegionEl) return;

    fromRegionEl.addEventListener('change', function () {
      updateDistricts('fromRegion', 'fromDistrict');
      updateToRegionOptions();
    });

    toRegionEl.addEventListener('change', function () {
      updateDistricts('toRegion', 'toDistrict');
    });

    window.addEventListener('languageChanged', function () {
      populateFromRegions();
      updateToRegionOptions();
      if (fromRegionEl.value) updateDistricts('fromRegion', 'fromDistrict');
      if (toRegionEl.value) updateDistricts('toRegion', 'toDistrict');
    });

    populateFromRegions();
    updateToRegionOptions();
  }

  /* --- departure time --------------------------------------------------- */

  function initDateTime() {
    var timeInput = document.getElementById('time');
    var placeholder = document.querySelector('.time-placeholder');
    if (!timeInput) return;

    function updateState() {
      timeInput.classList.toggle('has-value', Boolean(timeInput.value));
      if (!placeholder) return;
      var hide = Boolean(timeInput.value) || document.activeElement === timeInput;
      placeholder.hidden = hide;
    }

    function syncLimits() {
      var now = new Date();
      if (typeof window.formatDateTimeLocal === 'function') {
        timeInput.setAttribute('min', window.formatDateTimeLocal(now));
      }
      if (
        timeInput.value &&
        typeof window.isDateTimeAllowed === 'function' &&
        !window.isDateTimeAllowed(timeInput.value, now)
      ) {
        timeInput.value = '';
        updateState();
        window.showAlert(futureDateTimeMessage(), 'error');
      }
    }

    ['focus', 'blur', 'input', 'change'].forEach(function (evt) {
      timeInput.addEventListener(evt, function () {
        if (evt !== 'blur') syncLimits();
        updateState();
      });
    });

    var bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('reset', function () {
        window.setTimeout(function () {
          updateState();
          syncLimits();
        }, 0);
      });
    }

    updateState();
    syncLimits();
  }

  /* --- booking ---------------------------------------------------------- */

  function initBookingForm() {
    var form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('name').value.trim();
      var fromRegionEl = document.getElementById('fromRegion');
      var fromDistrictEl = document.getElementById('fromDistrict');
      var toRegionEl = document.getElementById('toRegion');
      var toDistrictEl = document.getElementById('toDistrict');
      var passengersEl = document.getElementById('passengers');
      var time = document.getElementById('time').value;
      var phone = document.getElementById('phone').value.trim();

      var fromRegion = fromRegionEl.value;
      var fromDistrict = fromDistrictEl.value;
      var toRegion = toRegionEl.value;
      var toDistrict = toDistrictEl.value;
      var passengers = passengersEl.value;

      if (!name || !fromRegion || !fromDistrict || !toRegion || !toDistrict || !passengers || !time || !phone) {
        window.showAlert(window.i18n.t('alert.fill_all_fields'), 'error');
        return;
      }

      if (typeof window.isDateTimeAllowed !== 'function' || !window.isDateTimeAllowed(time, new Date())) {
        window.showAlert(futureDateTimeMessage(), 'error');
        return;
      }

      if (!isValidName(name)) {
        window.showAlert(window.i18n.t('alert.invalid_name'), 'error');
        return;
      }

      if (!isValidPhone(phone)) {
        window.showAlert(window.i18n.t('alert.invalid_phone'), 'error');
        return;
      }

      function labelOf(select) {
        return select.options[select.selectedIndex].text;
      }

      var message =
        '🚕 Yangi buyurtma!\n\n' +
        '👤 Ism: ' + escapeText(name) + '\n' +
        '📞 Telefon: ' + escapeText(phone) + '\n' +
        '📍 Qayerdan: ' + escapeText(labelOf(fromRegionEl)) + ' / ' + escapeText(labelOf(fromDistrictEl)) + '\n' +
        '🏁 Qayerga: ' + escapeText(labelOf(toRegionEl)) + ' / ' + escapeText(labelOf(toDistrictEl)) + '\n' +
        "👥 Yo'lovchilar soni: " + escapeText(labelOf(passengersEl)) + '\n' +
        '🕒 Sana va vaqt: ' + escapeText(time);

      window.showConfirm(window.i18n.t('alert.confirm_order'), function () {
        send(
          { type: 'booking', name: name, phone: phone, message: message },
          'alert.booking_sent',
          'alert.booking_failed',
          function () { form.reset(); }
        );
      });
    });
  }

  /* --- feedback --------------------------------------------------------- */

  function initFeedbackForm() {
    var form = document.getElementById('feedbackForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('f_name').value.trim();
      var phone = document.getElementById('f_phone').value.trim();
      var messageText = document.getElementById('f_message').value.trim();

      if (!name || !phone || !messageText) {
        window.showAlert(window.i18n.t('alert.fill_all_fields'), 'error');
        return;
      }

      if (!isValidName(name)) {
        window.showAlert(window.i18n.t('alert.invalid_name'), 'error');
        return;
      }

      if (!isValidPhone(phone)) {
        window.showAlert(window.i18n.t('alert.invalid_phone'), 'error');
        return;
      }

      var message =
        '💬 Yangi taklif yoki talab\n\n' +
        '👤 Ism: ' + escapeText(name) + '\n' +
        '📞 Telefon: ' + escapeText(phone) + '\n' +
        '✉️ Habar: ' + escapeText(messageText);

      send(
        { type: 'feedback', name: name, phone: phone, message: message },
        'alert.feedback_sent',
        'alert.feedback_failed',
        function () { form.reset(); }
      );
    });
  }

  /* --- deep links ------------------------------------------------------- */

  function initHashTargets() {
    var hash = window.location.hash;
    if (!hash) return;

    var target = document.querySelector(hash);
    if (!target) return;

    window.setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (hash === '#booking-form') {
        var first = target.querySelector('input, select, button');
        if (first) first.focus({ preventScroll: true });
      }
    }, 150);
  }

  function init() {
    initRegionCascade();
    initDateTime();
    initBookingForm();
    initFeedbackForm();
    initHashTargets();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
