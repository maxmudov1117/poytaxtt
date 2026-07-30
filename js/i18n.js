(function () {
  var STORAGE_KEY = "poytaxt_lang";
  var currentLang = localStorage.getItem(STORAGE_KEY) || "uz";

  var districtKeys = {
    fargona: ["fargona_city", "qoqon", "margilon", "quva", "rishton", "oltioriq", "beshariq"],
    toshkent: ["yunusobod", "chilonzor", "yakkasaroy", "mirzo_ulugbek", "sergeli", "bektemir"]
  };

  var translations = {
    uz: {
      "page.title": "Poytaxt Taxi",
      "nav.home": "Asosiy",
      "nav.about": "Biz haqimizda",
      "nav.services": "Xizmatlar",
      "nav.news": "Yangiliklar",
      "nav.contact": "Biz bilan bog'lanish",
      "nav.current": "(current)",
      "hero.title": "Shaharlararo taxi",
      "hero.subtitle": "xizmatiga hush kelibsiz",
      "hero.details": "Batafsil",
      "form.order_title": "Buyurtma qoldirish",
      "form.name": "Ismingiz",
      "form.from_region": "Qayerdan (Viloyat)",
      "form.from_district": "Qaysi shahar yoki tumandan",
      "form.to_region": "Qayerga (Viloyat)",
      "form.to_district": "Qaysi shahar yoki tumanga",
      "form.datetime": "Sana va vaqt",
      "form.passengers": "Yo'lovchilar soni",
      "form.phone": "+998 __ ___ __ __",
      "form.submit": "Yuborish",
      "form.district_select": "Tuman / Shahar tanlang",
      "region.fargona": "Farg'ona",
      "region.toshkent": "Toshkent",
      "district.fargona_city": "Farg'ona shahri",
      "district.qoqon": "Qo'qon",
      "district.margilon": "Marg'ilon",
      "district.quva": "Quva",
      "district.rishton": "Rishton",
      "district.oltioriq": "Oltiariq",
      "district.beshariq": "Beshariq",
      "district.yunusobod": "Yunusobod",
      "district.chilonzor": "Chilonzor",
      "district.yakkasaroy": "Yakkasaroy",
      "district.mirzo_ulugbek": "Mirzo Ulug'bek",
      "district.sergeli": "Sergeli",
      "district.bektemir": "Bektemir",
      "about.title": "Biz<br>Haqimizda",
      "about.text": "2019 yildan beri 250 000+ xavfsiz safar.<br>Poytaxt Taxi shaharlararo tashuv sohasida barqaror va ishonchli xizmat ko'rsatib kelmoqda. Minglab doimiy mijozlar bizni tanlaydi, chunki biz uchun xavfsizlik, intizom va qulaylik ustuvor.<br>Har safar — mas'uliyat bilan.",
      "about.details": "Batafsil",
      "about.page_title": "Biz<br>haqimizda",
      "services.title": "Bizning<br>xizmatlar",
      "services.passenger.title": "Yo'lovchi tashish xizmati",
      "services.passenger.desc": "Farg'ona-Toshkent / Toshkent-Farg'ona",
      "services.airport.title": "Aeroportga olib borish",
      "services.airport.desc": "Aeroportdan olib kelish",
      "services.delivery.title": "Jo'natma xizmati",
      "services.delivery.desc": "Yuk va xujjatlarni yetkazib berish xizmati",
      "services.order": "Buyurtma berish",
      "news.title": "Bizning<br>yangiliklar",
      "news1.date": "23 Fevral 2026 yil",
      "news1.title": "Poytaxt Taxi'da aksiya",
      "news1.text": "Har hafta aniqlaymiz:<br>• Eng faol yo'lovchi<br>• Eng faol haydovchi<br><br>Mezon: hafta davomida eng ko'p buyurtma.<br>Tanlov tizim ma'lumotlari asosida.<br><br>🎁 G'oliblarga sovg'a.",
      "news2.date": "01 Nov 2019",
      "news2.title": "Eiusmod tempor incididunt",
      "news2.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",
      "news3.date": "01 Nov 2019",
      "news3.title": "Eiusmod tempor incididunt",
      "news3.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",

      "news4.date": "08 July 2026 yil",
      "news4.title": "Yangi qisqa raqam - 7799",
      "news4.text": "Endi bizga qo'ng'iroq qilish yanada oson! <br>Yangi qisqa raqam: <strong>7799</strong><br><br>Farg'ona — Toshkent — Farg'ona yo'nalishi bo'yicha narxlar:<br>• Oldingi o'rindiq — 180 000 so'm<br>• Orqa o'rindiq — 140 000 so'm<br><br>Qulay, xavfsiz va o'z vaqtida. Buyurtma uchun bizga qo'ng'iroq qiling: <strong>7799</strong>",
      "index.news_recent1.date": "10 Iyul 2026",
      "index.news_recent1.text": "Endi bizga qo'ng'iroq qilish yanada oson! Poytaxt taksi xizmati uchun yangi qisqa raqam — 7799. Bir marta tersangiz, kifoya.",
      "index.news_recent2.date": "08 July 2026",
      "index.news_recent2.text": "Farg'ona — Toshkent — Farg'ona yo'nalishi bo'yicha narxlar:<br>• Oldingi o'rindiq — 180 000 so'm<br>• Orqa o'rindiq — 140 000 so'm<br><br>Qulay, xavfsiz va o'z vaqtida. Buyurtma uchun bizga qo'ng'iroq qiling: <strong>7799</strong>",
      "clients.title": "Mijozlarni<br>biz haqimizda<br>fikrlari",
      "client1.text": "Salkam 5 yildan beri shu taksi kompaniyadan foydalanaman, qulay narxlar, ishonchli va tajribali haydovchilar. Hammaga tavsiya qilaman.",
      "client2.text": "Talabalar uchun eng yaxshi tanlov deb bilaman, mashinalar xolati, salon ozodaligi. Ushbu kompaniyani o'z tengdoshlarimga tavsiya qilaman.",
      "contact.title": "Talab va<br>Takliflar",
      "contact.form_title": "Talab va takliflaringizni qoldiring",
      "contact.name": "Ismingiz",
      "contact.phone": "+998 __ ___ __ __",
      "contact.message": "Habar qoldirish",
      "contact.submit": "Yuborish",
      "app.title": "Mobil ilovani yuklab oling",
      "app.desc": "Safar buyurtma qilish endi bir necha soniya ichida. Ilovani App Store yoki Play Market'dan yuklab oling, ro'yxatdan o'ting va qulay safarni boshlang",
      "why.title": "Nega<br>aynan Poytaxt Taxi",
      "why.drivers.title": "Malakali va tajribali haydovchilar",
      "why.drivers.text": "Tajribali, intizomli va mijozlarga hurmat bilan xizmat ko'rsatuvchi haydovchilar.",
      "why.safe.title": "Ishonchli va xavfsiz xizmat",
      "why.safe.text": "Biz mijozlar xavfsizligini birinchi o'ringa qo'yamiz. Toza avtomobillar, nazorat ostidagi buyurtmalar va shaffof xizmat — har safarda xotirjamlik kafolati.",
      "why.support.title": "24/7 Doimiy qo'llab-quvvatlash",
      "why.support.text": "Siz istalgan vaqtda biz bilan bog'lanishingiz mumkin. Operatorlarimiz 24/7 xizmat ko'rsatadi va har qanday savol yoki muammoni tezkor hal qiladi.",
      "footer.tagline": "Poytaxt Taxi - Har safarda qulaylik",
      "footer.rights": "Barcha huquqlar himoyalangan",
      "quick.label": "Buyurtma uchun:",
      "quick.text": "buyurtma uchun : 📞 7799",
      "alert.booking_sent": "Buyurtma yuborildi!",
      "alert.feedback_sent": "Xabaringiz yuborildi!",
      "alert.fill_all_fields": "Iltimos, barcha majburiy maydonlarni to'ldiring!",
      "alert.invalid_name": "Iltimos, ismingizni to'g'ri kiriting (faqat harflar, kamida 2 ta belgi)!",
      "alert.invalid_phone": "Iltimos, telefon raqamingizni to'g'ri formatda kiriting (masalan: +998 90 123 45 67)!",
      "alert.confirm_order": "Buyurtmani amalga oshirmoqchimisiz?",
      "alert.yes": "Ha",
      "alert.cancel": "Bekor qilish"
    },
    ru: {
      "page.title": "Poytaxt Taxi",
      "nav.home": "Главная",
      "nav.about": "О нас",
      "nav.services": "Услуги",
      "nav.news": "Новости",
      "nav.contact": "Связаться с нами",
      "nav.current": "(текущая)",
      "hero.title": "Междугороднее такси",
      "hero.subtitle": "добро пожаловать",
      "hero.details": "Подробнее",
      "form.order_title": "Оставить заказ",
      "form.name": "Ваше имя",
      "form.from_region": "Откуда (область)",
      "form.from_district": "Из какого города или района",
      "form.to_region": "Куда (область)",
      "form.to_district": "В какой город или район",
      "form.datetime": "Дата и время",
      "form.passengers": "Количество пассажиров",
      "form.phone": "+998 __ ___ __ __",
      "form.submit": "Отправить",
      "form.district_select": "Выберите город / район",
      "region.fargona": "Фергана",
      "region.toshkent": "Ташкент",
      "district.fargona_city": "г. Фергана",
      "district.qoqon": "Коканд",
      "district.margilon": "Маргилан",
      "district.quva": "Кува",
      "district.rishton": "Риштан",
      "district.oltioriq": "Алтыарык",
      "district.beshariq": "Бешарык",
      "district.yunusobod": "Юнусабад",
      "district.chilonzor": "Чилanzар",
      "district.yakkasaroy": "Яккасарай",
      "district.mirzo_ulugbek": "Мирzo Улугбек",
      "district.sergeli": "Сергели",
      "district.bektemir": "Бектемир",
      "about.title": "О<br>нас",
      "about.text": "С 2019 года более 250 000 безопасных поездок.<br>Poytaxt Taxi стабильно и надёжно работает в сфере междугородних перевозок. Тысячи постоянных клиентов выбирают нас, потому что для нас безопасность, дисциплина и комфорт — на первом месте.<br>Каждая поездка — с ответственностью.",
      "about.details": "Подробнее",
      "about.page_title": "О<br>нас",
      "services.title": "Наши<br>услуги",
      "services.passenger.title": "Перевозка пассажиров",
      "services.passenger.desc": "Фергана-Ташкент / Ташкент-Фергана",
      "services.airport.title": "Доставка в аэропорт",
      "services.airport.desc": "Встреча из аэропорта",
      "services.delivery.title": "Курьерская служба",
      "services.delivery.desc": "Доставка грузов и документов",
      "services.order": "Заказать",
      "news.title": "Наши<br>новости",
      "news1.date": "23 февраля 2026",
      "news1.title": "Акция в Poytaxt Taxi",
      "news1.text": "Каждую неделю определяем:<br>• Самого активного пассажира<br>• Самого активного водителя<br><br>Критерий: наибольшее количество заказов за неделю.<br>Выбор на основе данных системы.<br><br>🎁 Подарки победителям.",
      "news2.date": "01 ноя 2019",
      "news2.title": "Eiusmod tempor incididunt",
      "news2.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",
      "news3.date": "01 ноя 2019",
      "news3.title": "Eiusmod tempor incididunt",
      "news3.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",

      "news4.date": "08 Июля 2026",
      "news4.title": "Новый короткий номер - 7799",
      "news4.text": "Теперь звонить нам ещё проще!<br>Новый короткий номер: <strong>7799</strong><br><br>Цены по маршруту Фергана — Ташкент — Фергана:<br>• Переднее место — 180 000 сум<br>• Заднее место — 140 000 сум<br><br>Удобно, безопасно и вовремя. Чтобы заказать: звоните <strong>7799</strong>",
      "index.news_recent1.date": "10 Июля 2026",
      "index.news_recent1.text": "Теперь звонить нам ещё проще! Новый короткий номер для службы Poytaxt Taxi — 7799. Достаточно набрать один раз.",
      "index.news_recent2.date": "08 Июля 2026",
      "index.news_recent2.text": "Цены по маршруту Фергана — Ташкент — Фергана:<br>• Переднее место — 180 000 сум<br>• Заднее место — 140 000 сум<br><br>Удобно, безопасно и вовремя. Чтобы заказать: звоните <strong>7799</strong>",
      "clients.title": "Отзывы<br>клиентов<br>о нас",
      "client1.text": "Пользуюсь этой такси-компанией почти 5 лет — удобные цены, надёжные и опытные водители. Рекомендую всем.",
      "client2.text": "Считаю лучшим выбором для студентов — состояние машин, чистота салона. Рекомендую эту компанию своим сверстникам.",
      "contact.title": "Заявки и<br>предложения",
      "contact.form_title": "Оставьте заявку или предложение",
      "contact.name": "Ваше имя",
      "contact.phone": "+998 __ ___ __ __",
      "contact.message": "Оставить сообщение",
      "contact.submit": "Отправить",
      "app.title": "Скачайте мобильное приложение",
      "app.desc": "Заказ поездки теперь занимает несколько секунд. Скачайте приложение из App Store или Play Market, зарегистрируйтесь и начните комфортную поездку",
      "why.title": "Почему<br>именно Poytaxt Taxi",
      "why.drivers.title": "Квалифицированные и опытные водители",
      "why.drivers.text": "Опытные, дисциплинированные водители, уважительно обслуживающие клиентов.",
      "why.safe.title": "Надёжный и безопасный сервис",
      "why.safe.text": "Безопасность клиентов — наш приоритет. Чистые автомобили, контролируемые заказы и прозрачный сервис — гарантия спокойствия в каждой поездке.",
      "why.support.title": "Круглосуточная поддержка 24/7",
      "why.support.text": "Вы можете связаться с нами в любое время. Наши операторы работают 24/7 и быстро решают любые вопросы или проблемы.",
      "footer.tagline": "Poytaxt Taxi — комфорт в каждой поездке",
      "footer.rights": "Все права защищены",
      "quick.label": "Для заказа:",
      "quick.text": "для заказа: 📞 7799",
      "alert.booking_sent": "Заказ отправлен!",
      "alert.feedback_sent": "Ваше сообщение отправлено!",
      "alert.fill_all_fields": "Пожалуйста, заполните все обязательные поля!",
      "alert.invalid_name": "Пожалуйста, введите корректное имя (только буквы, минимум 2 символа)!",
      "alert.invalid_phone": "Пожалуйста, введите корректный номер телефона (например: +998 90 123 45 67)!",
      "alert.confirm_order": "Хотите оформить заказ?",
      "alert.yes": "Да",
      "alert.cancel": "Отмена"
    },
    en: {
      "page.title": "Poytaxt Taxi",
      "nav.home": "Home",
      "nav.about": "About Us",
      "nav.services": "Services",
      "nav.news": "News",
      "nav.contact": "Contact Us",
      "nav.current": "(current)",
      "hero.title": "Intercity taxi",
      "hero.subtitle": "welcome to our service",
      "hero.details": "Learn more",
      "form.order_title": "Place an order",
      "form.name": "Your name",
      "form.from_region": "From (region)",
      "form.from_district": "From which city or district",
      "form.to_region": "To (region)",
      "form.to_district": "To which city or district",
      "form.datetime": "Date and time",
      "form.passengers": "Number of passengers",
      "form.phone": "+998 __ ___ __ __",
      "form.submit": "Send",
      "form.district_select": "Select city / district",
      "region.fargona": "Fergana",
      "region.toshkent": "Tashkent",
      "district.fargona_city": "Fergana city",
      "district.qoqon": "Kokand",
      "district.margilon": "Margilan",
      "district.quva": "Quva",
      "district.rishton": "Rishton",
      "district.oltioriq": "Altyaryk",
      "district.beshariq": "Beshariq",
      "district.yunusobod": "Yunusabad",
      "district.chilonzor": "Chilanzar",
      "district.yakkasaroy": "Yakkasaray",
      "district.mirzo_ulugbek": "Mirzo Ulugbek",
      "district.sergeli": "Sergeli",
      "district.bektemir": "Bektemir",
      "about.title": "About<br>Us",
      "about.text": "Over 250,000 safe trips since 2019.<br>Poytaxt Taxi has been providing stable and reliable intercity transportation. Thousands of regular customers choose us because safety, discipline, and comfort are our priorities.<br>Every trip — with responsibility.",
      "about.details": "Learn more",
      "about.page_title": "About<br>Us",
      "services.title": "Our<br>services",
      "services.passenger.title": "Passenger transportation",
      "services.passenger.desc": "Fergana-Tashkent / Tashkent-Fergana",
      "services.airport.title": "Airport transfer",
      "services.airport.desc": "Pickup from the airport",
      "services.delivery.title": "Parcel delivery",
      "services.delivery.desc": "Delivery of cargo and documents",
      "services.order": "Order now",
      "news.title": "Our<br>news",
      "news1.date": "February 23, 2026",
      "news1.title": "Promotion at Poytaxt Taxi",
      "news1.text": "Every week we determine:<br>• The most active passenger<br>• The most active driver<br><br>Criteria: most orders during the week.<br>Selection based on system data.<br><br>🎁 Gifts for winners.",
      "news2.date": "Nov 01, 2019",
      "news2.title": "Eiusmod tempor incididunt",
      "news2.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",
      "news3.date": "Nov 01, 2019",
      "news3.title": "Eiusmod tempor incididunt",
      "news3.text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud",

      "news4.date": "July 08, 2026",
      "news4.title": "New short number - 7799",
      "news4.text": "Calling us just got easier!<br>New short number: <strong>7799</strong><br><br>Prices for Fergana — Tashkent — Fergana route:<br>• Front seat — 180,000 sum<br>• Back seat — 140,000 sum<br><br>Convenient, safe and on time. To book: call <strong>7799</strong>",
      "index.news_recent1.date": "10 July 2026",
      "index.news_recent1.text": "Calling us just got easier! The new short number for Poytaxt Taxi is 7799. Just dial once and that's it.",
      "index.news_recent2.date": "July 08, 2026",
      "index.news_recent2.text": "Prices for Fergana — Tashkent — Fergana route:<br>• Front seat — 180,000 UZS<br>• Back seat — 140,000 UZS<br><br>Convenient, safe and on time. To book: call <strong>7799</strong>",
      "clients.title": "Customer<br>reviews<br>about us",
      "client1.text": "I've been using this taxi company for almost 5 years — affordable prices, reliable and experienced drivers. I recommend it to everyone.",
      "client2.text": "I think it's the best choice for students — car condition, cabin cleanliness. I recommend this company to my peers.",
      "contact.title": "Requests &<br>suggestions",
      "contact.form_title": "Leave your request or suggestion",
      "contact.name": "Your name",
      "contact.phone": "+998 __ ___ __ __",
      "contact.message": "Leave a message",
      "contact.submit": "Send",
      "app.title": "Download the mobile app",
      "app.desc": "Booking a trip now takes just a few seconds. Download the app from App Store or Play Market, register, and start a comfortable journey",
      "why.title": "Why<br>Poytaxt Taxi",
      "why.drivers.title": "Skilled and experienced drivers",
      "why.drivers.text": "Experienced, disciplined drivers who serve customers with respect.",
      "why.safe.title": "Reliable and safe service",
      "why.safe.text": "We put customer safety first. Clean cars, monitored orders, and transparent service — peace of mind on every trip.",
      "why.support.title": "24/7 support",
      "why.support.text": "You can contact us at any time. Our operators work 24/7 and quickly resolve any questions or issues.",
      "footer.tagline": "Poytaxt Taxi — comfort on every trip",
      "footer.rights": "All rights reserved",
      "quick.label": "To book:",
      "quick.text": "To book: 📞 7799",
      "alert.booking_sent": "Order sent!",
      "alert.feedback_sent": "Your message has been sent!",
      "alert.fill_all_fields": "Please fill in all required fields!",
      "alert.invalid_name": "Please enter a valid name (letters only, at least 2 characters)!",
      "alert.invalid_phone": "Please enter a valid phone number (e.g. +998 90 123 45 67)!",
      "alert.confirm_order": "Do you want to place the order?",
      "alert.yes": "Yes",
      "alert.cancel": "Cancel"
    }
  };

  function t(key) {
    var langPack = translations[currentLang] || translations.uz;
    return langPack[key] !== undefined ? langPack[key] : (translations.uz[key] || key);
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });

    document.documentElement.lang = currentLang;
    document.title = t("page.title");

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
    });

    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: currentLang } }));
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
  }

  function initLangSwitcher() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLanguage(btn.getAttribute("data-lang"));
      });
    });
  }

  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    getLanguage: function () { return currentLang; },
    districtKeys: districtKeys,
    regionKeys: ["fargona", "toshkent"]
  };
  window.showAlert = function(message, type) {
    type = type || 'error';
    var toast = document.createElement('div');
    toast.className = 'custom-toast ' + (type === 'success' ? 'success' : 'error');
    toast.innerHTML = '<span>' + (type === 'success' ? '✅ ' : '⚠️ ') + message + '</span>';
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  window.showConfirm = function(message, onConfirm, onCancel) {
    var overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    
    var modal = document.createElement('div');
    modal.className = 'custom-confirm-modal';
    
    var text = document.createElement('p');
    text.textContent = message;
    
    var btnContainer = document.createElement('div');
    btnContainer.className = 'custom-confirm-buttons';
    
    var btnYes = document.createElement('button');
    btnYes.className = 'btn-yes';
    btnYes.textContent = window.i18n.t("alert.yes") || "Yes";
    
    var btnNo = document.createElement('button');
    btnNo.className = 'btn-no';
    btnNo.textContent = window.i18n.t("alert.cancel") || "Cancel";
    
    btnContainer.appendChild(btnNo);
    btnContainer.appendChild(btnYes);
    
    modal.appendChild(text);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    function close() {
      overlay.classList.add('fade-out');
      setTimeout(function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }
    
    btnYes.onclick = function() {
      close();
      if (onConfirm) onConfirm();
    };
    
    btnNo.onclick = function() {
      close();
      if (onCancel) onCancel();
    };
  };

  document.addEventListener("DOMContentLoaded", function () {
    initLangSwitcher();
    applyTranslations();
  });
})();
