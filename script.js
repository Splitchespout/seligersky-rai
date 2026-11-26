(() => {
  'use strict';

  /* =========================================================================
     ОФИЦИАЛЬНЫЙ ПРАЙС-ЛИСТ «СЕЛИГЕРСКИЙ РАЙ» (20.09.2026 – 29.12.2027)
     Все 6 периодов прайса + зимне-весеннее межсезонье для точного расчёта любых дат
     ========================================================================= */
  const PRICING = {
    townhouse: {
      title: 'Таунхаусы №1–4 (100 м², 2 этажа)',
      shortName: 'Таунхаус (100 м²)',
      tiers: ['до 6 гостей', '7 гостей', '8 гостей'],
      cols: ['До 6 чел.', '7 чел.', '8 чел.'],
      rates: {
        autumn26: [9000, 10000, 11000],
        ny:       [24000, 26000, 28000],
        winter27: [9000, 10000, 11000],
        spring27: [13000, 14500, 16000],
        summer27: [16000, 18000, 20000],
        sept27:   [13000, 14500, 16000],
        autumn27: [10000, 11000, 12000],
      }
    },
    cottage5: {
      title: 'Коттедж №5 (75 м², 2 спальни)',
      shortName: 'Коттедж №5 (75 м²)',
      tiers: ['до 4 гостей', '5 гостей', '6 гостей'],
      cols: ['До 4 чел.', '5 чел.', '6 чел.'],
      rates: {
        autumn26: [6000, 7000, 8000],
        ny:       [16000, 18000, 20000],
        winter27: [6000, 7000, 8000],
        spring27: [10000, 11500, 13000],
        summer27: [14000, 16000, 18000],
        sept27:   [10000, 11500, 13000],
        autumn27: [8000, 9000, 10000],
      }
    },
    cottage6: {
      title: 'Коттедж №6 (50 м², 1 спальня)',
      shortName: 'Коттедж №6 (50 м²)',
      tiers: ['до 2 гостей', '3 гостя', '4 гостя'],
      cols: ['До 2 чел.', '3 чел.', '4 чел.'],
      rates: {
        autumn26: [4000, 5000, 6000],
        ny:       [8000, 10000, 12000],
        winter27: [4000, 5000, 6000],
        spring27: [5500, 7000, 8500],
        summer27: [7000, 9000, 11000],
        sept27:   [5500, 7000, 8500],
        autumn27: [4000, 5000, 6000],
      }
    }
  };

  // Все 6 официальных строк прайса + зимнее межсезонье
  const PRICE_TABLE_PERIODS = [
    { key: 'autumn26', dates: '20.09.2026 – 29.12.2026', tag: 'Сейчас', hot: false, highlight: true },
    { key: 'ny',       dates: '30.12.2026 – 11.01.2027', tag: 'Новый год', hot: true, highlight: false },
    { key: 'winter27', dates: '12.01.2027 – 29.04.2027', tag: 'Зима / Весна', hot: false, highlight: false },
    { key: 'spring27', dates: '30.04.2027 – 17.06.2027', tag: 'Майские и июнь', hot: false, highlight: false },
    { key: 'summer27', dates: '18.06.2027 – 31.08.2027', tag: 'Высокий сезон', hot: true, highlight: false },
    { key: 'sept27',   dates: '01.09.2027 – 19.09.2027', tag: 'Бархатный сезон', hot: false, highlight: false },
    { key: 'autumn27', dates: '20.09.2027 – 29.12.2027', tag: '', hot: false, highlight: false },
  ];

  const PET_FEE_PER_NIGHT = 500;
  const fmtRub = (n) => `${n.toLocaleString('ru-RU')} ₽`;

  // Утилиты работы с датами (локальная дата без сдвига часовых поясов)
  function toIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function parseIsoDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(dateObj, days) {
    const copy = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  function fmtRuDate(dateObj) {
    return dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtRuShort(dateObj) {
    return dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
  }

  function pluralNights(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} ночь`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ночи`;
    return `${n} ночей`;
  }

  // Определение сезонного ключа по конкретной календарной ночи
  function getSeasonKeyForDate(d) {
    const iso = toIsoDate(d);
    if (iso >= '2026-09-20' && iso <= '2026-12-29') return 'autumn26';
    if (iso >= '2026-12-30' && iso <= '2027-01-11') return 'ny';
    if (iso >= '2027-01-12' && iso <= '2027-04-29') return 'winter27';
    if (iso >= '2027-04-30' && iso <= '2027-06-17') return 'spring27';
    if (iso >= '2027-06-18' && iso <= '2027-08-31') return 'summer27';
    if (iso >= '2027-09-01' && iso <= '2027-09-19') return 'sept27';
    if (iso >= '2027-09-20' && iso <= '2027-12-29') return 'autumn27';

    // Универсальный расчёт по календарю для дат за пределами 2027 года
    const md = iso.slice(5);
    if (md >= '12-30' || md <= '01-11') return 'ny';
    if (md >= '06-18' && md <= '08-31') return 'summer27';
    if ((md >= '04-30' && md <= '06-17') || (md >= '09-01' && md <= '09-19')) return 'spring27';
    return 'autumn27';
  }

  /* =========================================================================
     1. МОБИЛЬНОЕ МЕНЮ И ПОДСВЕТКА АКТИВНОГО РАЗДЕЛА В ШАПКЕ (ScrollSpy)
     ========================================================================= */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMobileMenuOpen(open) {
    if (!burgerBtn || !mobileMenu) return;
    mobileMenu.hidden = !open;
    burgerBtn.classList.toggle('is-open', open);
    burgerBtn.setAttribute('aria-expanded', String(open));
    burgerBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }

  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      setMobileMenuOpen(mobileMenu.hidden);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMobileMenuOpen(false));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.hidden) {
        setMobileMenuOpen(false);
        burgerBtn.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && !mobileMenu.hidden) {
        setMobileMenuOpen(false);
      }
    });
  }

  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const observedSections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const spy = new IntersectionObserver((entries) => {
      if (window.scrollY < 260) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    observedSections.forEach((sec) => spy.observe(sec));

    window.addEventListener('scroll', () => {
      if (window.scrollY < 260) {
        navLinks.forEach((a) => a.classList.remove('is-current'));
      }
    }, { passive: true });
  }

  /* =========================================================================
     2. ПОСУТОЧНЫЙ КАЛЬКУЛЯТОР СТОИМОСТИ ПО КАЛЕНДАРНЫМ ДАТАМ
     ========================================================================= */
  const today = new Date();
  const todayClean = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Ближайшая пятница – воскресенье (2 ночи)
  function getNextWeekend() {
    const day = todayClean.getDay(); // 0=Вс, 5=Пт
    const daysToFri = (5 - day + 7) % 7 || 7;
    const fri = addDays(todayClean, daysToFri);
    return [fri, addDays(fri, 2)];
  }

  const [defIn, defOut] = getNextWeekend();

  const HERO_HOUSES = {
    townhouse: {
      badge: 'Таунхаусы №1–4 · 100 м²',
      kicker: 'Выбран в расчёте · 2 этажа · 3 спальни · до 8 гостей',
      title: 'Таунхаусы 100 м² на первой линии Селигера',
      lead: 'Двухэтажные кирпичные дома в 20 м от собственного песчаного пляжа 100 м. Три спальни, лоджия на озеро, кухня с посудой, своя беседка, мангал и казан.',
      chips: ['100 м² · 2 этажа', 'Пляж 100 м', '2 пирса + слип', 'Беседка и казан', 'Дети до 5 лет — 0 ₽'],
      photos: [
        { src: 'images/interiors/th_18.jpg', alt: 'Таунхаусы №1–4 (100 м²) с двумя беседками на берегу Селигера', pos: 'center 28%' },
        { src: 'images/hero/pier-townhouses.jpg', alt: 'Вид с деревянного пирса на таунхаусы и песчаный пляж', pos: 'center 46%' }
      ]
    },
    cottage5: {
      badge: 'Коттедж №5 · 75 м²',
      kicker: 'Выбран в расчёте · 1 этаж · 2 спальни · до 6 гостей',
      title: 'Коттедж №5 с панорамным окном на озеро',
      lead: 'Отдельно стоящий тёплый дом прямо на песчаном берегу в 20 м от воды. Гостиная с панорамным видом на Селигер, две спальни, кухня и просторная терраса.',
      chips: ['75 м² · 2 спальни', 'Панорамное окно', 'Своя терраса', 'Пляж 100 м', 'Можно с питомцем'],
      photos: [
        { src: 'images/interiors/c5_20.jpg', alt: 'Коттедж №5 (75 м²) с большим панорамным окном на озеро', pos: 'center 32%' },
        { src: 'images/hero/cottages-beach.jpg', alt: 'Коттеджи №5 и №6 на собственном песчаном берегу Селигера', pos: 'center 44%' }
      ]
    },
    cottage6: {
      badge: 'Коттедж №6 · 50 м²',
      kicker: 'Выбран в расчёте · 1 этаж · 1 спальня · до 4 гостей',
      title: 'Уютный коттедж №6 прямо у кромки воды',
      lead: 'Идеальный дом для пары или семьи с детьми в 20 м от озера. Светлая гостиная с панорамным окном, отдельная спальня, крытая терраса со столом и личный мангал.',
      chips: ['50 м² · до 4 гостей', 'От 4 000 ₽/сут', 'Терраса и мангал', 'Пляж 100 м', 'Дети до 5 лет — 0 ₽'],
      photos: [
        { src: 'images/interiors/c6_14.jpg', alt: 'Коттедж №6 (50 м²) с панорамным окном, террасой и мангалом', pos: 'center 34%' },
        { src: 'images/hero/pier-panorama.jpg', alt: 'Вид с пирса на песчаный пляж и коттеджи у воды', pos: 'center 46%' }
      ]
    }
  };

  const state = {
    house: 'townhouse',
    heroAngle: 0,
    checkIn: toIsoDate(defIn),
    checkOut: toIsoDate(defOut),
    tierIdx: 0,
    withPet: false,
    activePriceTab: 'townhouse',
  };

  // Отобранные реальные фото интерьеров внутри каждого дома
  const ROOM_GALLERIES = {
    townhouse: [
      { src: 'images/rooms/th/th_14.jpg', caption: 'Таунхаусы №1–4 · Современная оборудованная кухня (плита, вытяжка, СВЧ, холодильник)' },
      { src: 'images/rooms/th/th_17.jpg', caption: 'Таунхаусы №1–4 · Панорамная застеклённая лоджия 2-го этажа с видом на Селигер' },
      { src: 'images/rooms/th/th_04.jpg', caption: 'Таунхаусы №1–4 · Первая спальня с двуспальной кроватью' },
      { src: 'images/rooms/th/th_08.jpg', caption: 'Таунхаусы №1–4 · Вторая спальня на 2-м этаже' },
      { src: 'images/rooms/th/th_05.jpg', caption: 'Таунхаусы №1–4 · Третья спальня в светлых тонах' },
      { src: 'images/rooms/th/th_02.jpg', caption: 'Таунхаусы №1–4 · Крытая терраса 1-го этажа со столом и скамьями' },
      { src: 'images/rooms/th/th_10.jpg', caption: 'Таунхаусы №1–4 · Санузел с раковиной, зеркалом и водонагревателем' }
    ],
    cottage5: [
      { src: 'images/rooms/c5/c5_08.jpg', caption: 'Коттедж №5 (75 м²) · Светлая гостиная с большим панорамным окном на озеро и ТВ' },
      { src: 'images/rooms/c5/c5_16.jpg', caption: 'Коттедж №5 (75 м²) · Просторная кухня с обеденной зоной и полным набором посуды' },
      { src: 'images/rooms/c5/c5_03.jpg', caption: 'Коттедж №5 (75 м²) · Первая отдельная спальня' },
      { src: 'images/rooms/c5/c5_02.jpg', caption: 'Коттедж №5 (75 м²) · Вторая отдельная спальня с ТВ и шкафом' },
      { src: 'images/rooms/c5/c5_11.jpg', caption: 'Коттедж №5 (75 м²) · Санузел с раковиной, зеркалом и стиральной машиной' },
      { src: 'images/rooms/c5/c5_18.jpg', caption: 'Коттедж №5 (75 м²) · Просторная крытая терраса у входа' }
    ],
    cottage6: [
      { src: 'images/rooms/c6/c6_04.jpg', caption: 'Коттедж №6 (50 м²) · Светлая гостиная с панорамным окном на озеро Селигер' },
      { src: 'images/rooms/c6/c6_10.jpg', caption: 'Коттедж №6 (50 м²) · Оборудованная кухня (стеклокерамика, вытяжка, СВЧ, холодильник)' },
      { src: 'images/rooms/c6/c6_02.jpg', caption: 'Коттедж №6 (50 м²) · Уютная отдельная спальня с двуспальной кроватью' },
      { src: 'images/rooms/c6/c6_03.jpg', caption: 'Коттедж №6 (50 м²) · Гостиная с диваном и зоной отдыха' },
      { src: 'images/rooms/c6/c6_07.jpg', caption: 'Коттедж №6 (50 м²) · Просторный санузел с раковиной, окном и полотенцесушителем' },
      { src: 'images/rooms/c6/c6_13.jpg', caption: 'Коттедж №6 (50 м²) · Крытая терраса, личный мангал и печь под казан у крыльца' }
    ]
  };

  const heroImgA = document.getElementById('heroImgA');
  const heroImgB = document.getElementById('heroImgB');
  const heroHouseBadge = document.getElementById('heroHouseBadge');
  const heroHouseKicker = document.getElementById('heroHouseKicker');
  const heroHouseTitle = document.getElementById('heroHouseTitle');
  const heroHouseLead = document.getElementById('heroHouseLead');
  const heroHouseChips = document.getElementById('heroHouseChips');
  const heroAngleBtns = document.querySelectorAll('[data-hero-angle]');
  const heroInteriorBtn = document.getElementById('heroInteriorBtn');
  let heroFrontLayer = 'A';

  function updateHeroShowcase(houseKey, angleIdx = 0) {
    const data = HERO_HOUSES[houseKey];
    if (!data) return;
    state.heroAngle = angleIdx;
    const photo = data.photos[angleIdx] || data.photos[0];
    const roomCount = (ROOM_GALLERIES[houseKey] || []).length;

    heroHouseBadge.textContent = data.badge;
    heroHouseKicker.textContent = data.kicker;
    heroHouseTitle.textContent = data.title;
    heroHouseLead.textContent = data.lead;
    heroHouseChips.textContent = '';
    data.chips.forEach((c) => {
      const span = document.createElement('span');
      span.className = 'hero-chip';
      span.textContent = c;
      heroHouseChips.appendChild(span);
    });
    if (heroInteriorBtn) {
      heroInteriorBtn.textContent = `Внутри (${roomCount})`;
    }

    heroAngleBtns.forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.heroAngle) === angleIdx);
    });

    const currentEl = heroFrontLayer === 'A' ? heroImgA : heroImgB;
    const nextEl = heroFrontLayer === 'A' ? heroImgB : heroImgA;

    if (currentEl.getAttribute('src') === photo.src) {
      currentEl.style.objectPosition = photo.pos;
      return;
    }

    nextEl.src = photo.src;
    nextEl.alt = photo.alt;
    nextEl.style.objectPosition = photo.pos;
    nextEl.classList.add('is-visible');
    currentEl.classList.remove('is-visible');
    heroFrontLayer = heroFrontLayer === 'A' ? 'B' : 'A';
  }

  heroAngleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      updateHeroShowcase(state.house, Number(btn.dataset.heroAngle));
    });
  });

  const houseOpts = document.querySelectorAll('.house-opt');
  const calcCheckIn = document.getElementById('calcCheckIn');
  const calcCheckOut = document.getElementById('calcCheckOut');
  const presetBtns = document.querySelectorAll('.preset-chip');
  const calcGuests = document.getElementById('calcGuests');
  const calcPet = document.getElementById('calcPet');
  const calcTotalPrice = document.getElementById('calcTotalPrice');
  const calcBreakdown = document.getElementById('calcBreakdown');
  const calcPrepayAmt = document.getElementById('calcPrepayAmt');
  const calcPrepayRule = document.getElementById('calcPrepayRule');

  calcCheckIn.min = toIsoDate(todayClean);
  calcCheckIn.value = state.checkIn;
  calcCheckOut.min = toIsoDate(addDays(defIn, 1));
  calcCheckOut.value = state.checkOut;

  function populateGuestsSelect() {
    const cfg = PRICING[state.house];
    calcGuests.innerHTML = '';
    cfg.tiers.forEach((label, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = label;
      calcGuests.appendChild(opt);
    });
    state.tierIdx = Math.min(state.tierIdx, cfg.tiers.length - 1);
    calcGuests.value = String(state.tierIdx);
  }

  function calculateStay() {
    const cfg = PRICING[state.house];
    let start = state.checkIn ? parseIsoDate(state.checkIn) : defIn;
    if (isNaN(start.getTime()) || start < todayClean) {
      start = defIn;
      state.checkIn = toIsoDate(start);
      calcCheckIn.value = state.checkIn;
    }

    let end = state.checkOut ? parseIsoDate(state.checkOut) : addDays(start, 2);
    if (isNaN(end.getTime()) || end <= start) {
      end = addDays(start, 1);
      state.checkOut = toIsoDate(end);
      calcCheckOut.value = state.checkOut;
    }

    let nights = Math.round((end - start) / 86400000);
    if (nights > 60) {
      nights = 60;
      end = addDays(start, 60);
      state.checkOut = toIsoDate(end);
      calcCheckOut.value = state.checkOut;
    }

    let staySum = 0;
    let hasNy = false;
    const rateBuckets = new Map();

    for (let i = 0; i < nights; i += 1) {
      const nightDate = addDays(start, i);
      const sKey = getSeasonKeyForDate(nightDate);
      if (sKey === 'ny') hasNy = true;
      const nightRate = cfg.rates[sKey][state.tierIdx];
      staySum += nightRate;
      rateBuckets.set(nightRate, (rateBuckets.get(nightRate) || 0) + 1);
    }

    const petTotal = state.withPet ? nights * PET_FEE_PER_NIGHT : 0;
    const total = staySum + petTotal;
    const prepayPct = hasNy ? 50 : 20;
    const prepay = Math.round(total * prepayPct / 100);
    const guestLabel = cfg.tiers[state.tierIdx];

    let rateNote;
    if (rateBuckets.size === 1) {
      const [singleRate] = rateBuckets.keys();
      rateNote = `${pluralNights(nights)} × ${fmtRub(singleRate)}`;
    } else {
      const parts = Array.from(rateBuckets.entries())
        .map(([rate, cnt]) => `${cnt} н. × ${fmtRub(rate)}`);
      rateNote = `Смешанный сезон: ${parts.join(' + ')}`;
    }

    const petNote = state.withPet ? ` + питомец (${fmtRub(petTotal)})` : '';
    const datesShort = `${fmtRuShort(start)} – ${fmtRuShort(end)}`;
    const datesFull = `${fmtRuDate(start)} – ${fmtRuDate(end)}`;

    return {
      cfg,
      nights,
      total,
      prepay,
      prepayPct,
      hasNy,
      guestLabel,
      datesShort,
      datesFull,
      breakdownText: `${datesShort} · ${rateNote}${petNote}`,
      summaryText: `${cfg.shortName} · ${datesFull} (${pluralNights(nights)}) · ${guestLabel}${petNote} — Итого ${fmtRub(total)} (аванс ${prepayPct}%: ${fmtRub(prepay)})`
    };
  }

  function updateCalculator() {
    const res = calculateStay();
    calcTotalPrice.textContent = fmtRub(res.total);
    calcBreakdown.textContent = res.breakdownText;
    calcPrepayAmt.textContent = `Аванс ${fmtRub(res.prepay)}`;
    calcPrepayRule.textContent = res.hasNy
      ? '50% · новогодний тариф'
      : '20% · возврат за 15 сут.';
  }

  function setDates(inDate, outDate, presetName) {
    state.checkIn = toIsoDate(inDate);
    state.checkOut = toIsoDate(outDate);
    calcCheckIn.value = state.checkIn;
    calcCheckOut.min = toIsoDate(addDays(inDate, 1));
    calcCheckOut.value = state.checkOut;
    presetBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.preset === presetName));
    updateCalculator();
  }

  function selectHouse(houseKey) {
    state.house = houseKey;
    houseOpts.forEach((btn) => {
      const active = btn.dataset.house === houseKey;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(active));
    });
    updateHeroShowcase(houseKey, 0);
    populateGuestsSelect();
    updateCalculator();
  }

  houseOpts.forEach((btn) => {
    btn.addEventListener('click', () => selectHouse(btn.dataset.house));
  });

  function handleCheckInChange() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(calcCheckIn.value)) return;
    const prevIn = parseIsoDate(state.checkIn);
    const prevOut = parseIsoDate(state.checkOut);
    const prevNights = (!isNaN(prevIn) && !isNaN(prevOut) && prevOut > prevIn)
      ? Math.max(1, Math.min(60, Math.round((prevOut - prevIn) / 86400000)))
      : 2;

    let inD = parseIsoDate(calcCheckIn.value);
    if (isNaN(inD.getTime()) || inD < todayClean) {
      inD = todayClean;
      calcCheckIn.value = toIsoDate(inD);
    }

    state.checkIn = toIsoDate(inD);
    calcCheckOut.min = toIsoDate(addDays(inD, 1));

    const outD = parseIsoDate(state.checkOut);
    if (isNaN(outD.getTime()) || outD <= inD) {
      const nextOut = addDays(inD, prevNights);
      state.checkOut = toIsoDate(nextOut);
      calcCheckOut.value = state.checkOut;
    }
    presetBtns.forEach((b) => b.classList.remove('is-active'));
    updateCalculator();
  }

  function handleCheckOutChange() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(calcCheckOut.value)) return;
    const inD = parseIsoDate(state.checkIn);
    let outD = parseIsoDate(calcCheckOut.value);
    if (isNaN(outD.getTime()) || outD <= inD) {
      outD = addDays(inD, 1);
      calcCheckOut.value = toIsoDate(outD);
    }
    state.checkOut = toIsoDate(outD);
    presetBtns.forEach((b) => b.classList.remove('is-active'));
    updateCalculator();
  }

  calcCheckIn.addEventListener('change', handleCheckInChange);
  calcCheckIn.addEventListener('input', handleCheckInChange);
  calcCheckOut.addEventListener('change', handleCheckOutChange);
  calcCheckOut.addEventListener('input', handleCheckOutChange);

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.preset;
      if (p === 'weekend') {
        const [f, s] = getNextWeekend();
        setDates(f, s, p);
      } else if (p === 'ny') {
        setDates(new Date(2026, 11, 30), new Date(2027, 0, 2), p);
      } else if (p === 'may') {
        setDates(new Date(2027, 4, 1), new Date(2027, 4, 4), p);
      } else if (p === 'july') {
        setDates(new Date(2027, 6, 10), new Date(2027, 6, 15), p);
      }
    });
  });

  calcGuests.addEventListener('change', () => {
    state.tierIdx = Number(calcGuests.value);
    updateCalculator();
  });

  calcPet.addEventListener('change', () => {
    state.withPet = calcPet.checked;
    updateCalculator();
  });

  updateHeroShowcase(state.house, 0);
  populateGuestsSelect();
  updateCalculator();

  /* =========================================================================
     3. ПЕРЕКЛЮЧЕНИЕ РАКУРСА ФОТО В КАРТОЧКАХ ДОМОВ
     ========================================================================= */
  document.querySelectorAll('.house-media').forEach((media) => {
    const img = media.querySelector('img');
    const btn = media.querySelector('.photo-toggle-btn');
    if (!img || !btn) return;
    const primarySrc = img.getAttribute('src');
    const altSrc = img.dataset.altSrc;
    let showingAlt = false;

    btn.addEventListener('click', () => {
      showingAlt = !showingAlt;
      img.src = showingAlt ? altSrc : primarySrc;
      btn.textContent = showingAlt ? 'Основное фото' : 'Другой ракурс';
    });
  });

  /* =========================================================================
     4. ИНТЕРАКТИВНАЯ ТАБЛИЦА ПРАЙС-ЛИСТА 2026–2027
     ========================================================================= */
  const priceTabs = document.querySelectorAll('.price-tab');
  const priceTableTitle = document.getElementById('priceTableTitle');
  const colTier1 = document.getElementById('colTier1');
  const colTier2 = document.getElementById('colTier2');
  const colTier3 = document.getElementById('colTier3');
  const priceTableBody = document.getElementById('priceTableBody');

  function renderPriceTable(houseKey) {
    state.activePriceTab = houseKey;
    const cfg = PRICING[houseKey];
    priceTableTitle.textContent = cfg.title;
    colTier1.textContent = cfg.cols[0];
    colTier2.textContent = cfg.cols[1];
    colTier3.textContent = cfg.cols[2];

    priceTableBody.innerHTML = PRICE_TABLE_PERIODS.map((p) => {
      const vals = cfg.rates[p.key];
      const badge = p.tag
        ? `<span class="season-tag${p.hot ? ' hot' : ''}">${p.tag}</span>`
        : '';
      const cls = p.highlight ? ' class="is-highlight"' : '';
      return `<tr${cls}>
        <td>${p.dates}${badge}</td>
        <td>${fmtRub(vals[0])}</td>
        <td>${fmtRub(vals[1])}</td>
        <td>${fmtRub(vals[2])}</td>
      </tr>`;
    }).join('');
  }

  priceTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      priceTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      renderPriceTable(tab.dataset.priceTab);
    });
  });

  renderPriceTable('townhouse');

  /* =========================================================================
     5. ФИЛЬТР ГАЛЕРЕИ И LIGHTBOX (<dialog>)
     ========================================================================= */
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (galleryGrid) galleryGrid.classList.toggle('is-filtered', cat !== 'all');
      galleryItems.forEach((item) => {
        item.hidden = cat !== 'all' && item.dataset.cat !== cat;
      });
    });
  });

  const lightbox = document.getElementById('lightboxDialog');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxStrip = document.getElementById('lightboxStrip');
  let activeSlides = [];
  let currentLbIdx = 0;

  function renderLightboxStrip() {
    lightboxStrip.innerHTML = '';
    activeSlides.forEach((slide, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `lightbox-strip-btn${idx === currentLbIdx ? ' is-active' : ''}`;
      btn.setAttribute('aria-label', slide.caption || `Фото ${idx + 1}`);
      const im = document.createElement('img');
      im.src = slide.src;
      im.alt = '';
      btn.appendChild(im);
      btn.addEventListener('click', () => showLightbox(idx));
      lightboxStrip.appendChild(btn);
    });
  }

  function showLightbox(idx) {
    if (!activeSlides.length) return;
    currentLbIdx = (idx + activeSlides.length) % activeSlides.length;
    const slide = activeSlides[currentLbIdx];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.caption || '';
    lightboxCaption.textContent = slide.caption || '';
    lightboxCounter.textContent = `${currentLbIdx + 1} / ${activeSlides.length}`;
    lightboxStrip.querySelectorAll('.lightbox-strip-btn').forEach((b, i) => {
      b.classList.toggle('is-active', i === currentLbIdx);
    });
  }

  function openLightboxWithSlides(slides, startIdx = 0) {
    activeSlides = slides;
    currentLbIdx = startIdx;
    renderLightboxStrip();
    showLightbox(startIdx);
    lightbox.showModal();
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const visible = galleryItems.filter((el) => !el.hidden);
      const slides = visible.map((el) => {
        const im = el.querySelector('img');
        return { src: im.getAttribute('src'), caption: el.dataset.caption || im.alt };
      });
      const idx = visible.indexOf(item);
      openLightboxWithSlides(slides, idx >= 0 ? idx : 0);
    });
  });

  // Галереи для карточек «Пляж и пирсы» и «Прокат и акватория Селигера»
  const ACTIVITY_GALLERIES = {
    shore: [
      { src: 'images/hero/pier-seliger.jpg', caption: 'Собственный деревянный пирс и выход в синий Селигер прямо с пляжа базы' },
      { src: 'images/hero/pier-panorama.jpg', caption: 'Вид с пирса на 100-метровый песчаный пляж, таунхаусы и коттеджи у соснового леса' },
      { src: 'images/gallery/beach-loungers.jpg', caption: 'Собственный песчаный пляж 100 м с лежаками, сапбордами и видом на Селигер' },
      { src: 'images/hero/courtyard-gazebo.jpg', caption: 'Беседки, детский батут и ухоженная зелёная территория рядом с домами' },
      { src: 'images/gallery/bbq-zone.jpg', caption: 'Мангал, печь под казан, шампуры и решётки бесплатно у каждого дома' }
    ],
    fleet: [
      { src: 'images/gallery/boats-pier.jpg', caption: 'Причал базы: 4-местный катамаран и прогулочная лодка с тентом у деревянного пирса' },
      { src: 'images/hero/beach-sup.jpg', caption: 'Прокат сапбордов (SUP) прямо на берегу — 500 ₽/час' },
      { src: 'images/gallery/catamaran-lake.jpg', caption: 'Прогулки по спокойной воде Селигера на 4-местном катамаране' },
      { src: 'images/gallery/seliger-fishing-day.jpg', caption: 'Спокойная рыбалка с лодки на тихой глади Селигера' },
      { src: 'images/gallery/seliger-open-water.jpg', caption: 'Широкие просторы озера Селигер для прогулок на катере и рыбалки' }
    ],
    fishing: [
      { src: 'images/gallery/seliger-fishing-day.jpg', caption: 'Спокойная дневная рыбалка с лодки на озере Селигер' },
      { src: 'images/gallery/fishing-catch.jpg', caption: 'Настоящий улов наших гостей прямо на пирсе базы отдыха «Селигерский рай»' },
      { src: 'images/gallery/fishing-shore.jpg', caption: 'Рыбалка с собственного песчаного берега и пирсов базы' }
    ]
  };

  // Открытие галереи интерьеров из карточек домов и с Hero-баннера
  document.querySelectorAll('[data-open-rooms]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const houseKey = btn.dataset.openRooms;
      const startIdx = Number(btn.dataset.roomIdx || 0);
      const slides = ROOM_GALLERIES[houseKey] || [];
      if (slides.length) openLightboxWithSlides(slides, startIdx);
    });
  });

  // Открытие галереи пирса, пляжа и водного отдыха из блока «Пляж и прокат»
  document.querySelectorAll('[data-open-activity]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const actKey = btn.dataset.openActivity;
      const startIdx = Number(btn.dataset.actIdx || 0);
      const slides = ACTIVITY_GALLERIES[actKey] || [];
      if (slides.length) openLightboxWithSlides(slides, startIdx);
    });
  });

  if (heroInteriorBtn) {
    heroInteriorBtn.addEventListener('click', () => {
      const slides = ROOM_GALLERIES[state.house] || [];
      if (slides.length) openLightboxWithSlides(slides, 0);
    });
  }

  document.getElementById('lightboxPrev').addEventListener('click', () => showLightbox(currentLbIdx - 1));
  document.getElementById('lightboxNext').addEventListener('click', () => showLightbox(currentLbIdx + 1));
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;
    if (e.key === 'ArrowLeft') showLightbox(currentLbIdx - 1);
    if (e.key === 'ArrowRight') showLightbox(currentLbIdx + 1);
  });

  /* =========================================================================
     6. КОПИРОВАНИЕ GPS И МОДАЛЬНОЕ ОКНО БРОНИРОВАНИЯ (<dialog>)
     ========================================================================= */
  const copyCoordsBtn = document.getElementById('copyCoordsBtn');
  if (copyCoordsBtn) {
    copyCoordsBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('57.098416, 33.227065');
        copyCoordsBtn.textContent = 'GPS скопирован ✓';
        setTimeout(() => { copyCoordsBtn.textContent = 'GPS: 57.0984, 33.2271'; }, 2000);
      } catch (_) {}
    });
  }

  const bookingDialog = document.getElementById('bookingDialog');
  const bookingSummaryBox = document.getElementById('bookingSummaryBox');
  const bookingForm = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const bookingSuccessText = document.getElementById('bookingSuccessText');
  const copyRequestBtn = document.getElementById('copyRequestBtn');
  const editRequestBtn = document.getElementById('editRequestBtn');
  let lastRequestMessage = '';

  let customModalContext = null;

  function openBookingModal(customText = null) {
    bookingForm.hidden = false;
    bookingSuccess.hidden = true;
    copyRequestBtn.textContent = 'Скопировать текст заявки';
    customModalContext = customText;
    const summary = customText || calculateStay().summaryText;
    bookingSummaryBox.textContent = summary;
    bookingDialog.showModal();
  }

  document.getElementById('calcBookBtn').addEventListener('click', () => openBookingModal());
  document.getElementById('contactsBookBtn').addEventListener('click', () => openBookingModal());
  document.getElementById('eventsBookBtn').addEventListener('click', () => {
    openBookingModal('Аренда всей базы под мероприятие (до 42 гостей · 4 таунхауса + 2 коттеджа · закрытый берег 100 м)');
  });
  document.getElementById('fishingBookBtn').addEventListener('click', () => {
    openBookingModal(`${calculateStay().summaryText} · Поездка на рыбалку (пирсы / слип / лодка)`);
  });
  document.getElementById('mobileBarBookBtn').addEventListener('click', () => {
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
  });

  // Исправленная синхронизация: кнопка в прайсе открывает бронь именно выбранного в прайсе дома
  document.getElementById('priceBookBtn').addEventListener('click', () => {
    selectHouse(state.activePriceTab);
    openBookingModal();
  });

  document.querySelectorAll('[data-pick-house]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectHouse(btn.dataset.pickHouse);
      openBookingModal();
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => bookingDialog.close());
  });

  bookingDialog.addEventListener('click', (e) => {
    if (e.target === bookingDialog) bookingDialog.close();
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const comment = document.getElementById('guestComment').value.trim();
    const baseText = customModalContext || calculateStay().summaryText;

    const extra = comment ? ` Пожелания: ${comment}.` : '';
    lastRequestMessage = `Заявка в «Селигерский рай»: ${baseText}. Имя: ${name}, тел: ${phone}.${extra}`;
    bookingSuccessText.textContent = lastRequestMessage;
    bookingForm.hidden = true;
    bookingSuccess.hidden = false;
  });

  if (editRequestBtn) {
    editRequestBtn.addEventListener('click', () => {
      bookingSuccess.hidden = true;
      bookingForm.hidden = false;
    });
  }

  copyRequestBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(lastRequestMessage);
      copyRequestBtn.textContent = 'Текст заявки скопирован ✓';
      setTimeout(() => { copyRequestBtn.textContent = 'Скопировать текст заявки'; }, 2000);
    } catch (_) {
      copyRequestBtn.textContent = 'Позвоните нам напрямую';
    }
  });

  /* =========================================================================
     7. ПЛАВНОЕ ПОЯВЛЕНИЕ КАРТОЧЕК ПРИ ПРОКРУТКЕ (SCROLL-REVEAL) И КНОПКА «НАВЕРХ»
     ========================================================================= */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = Array.from(document.querySelectorAll(
    '.highlight-card, .house-card, .price-table-card, .rules-card, .activity-panel, .fishing-feature, .events-banner, .gallery-item, .nearby-card, .reviews-banner, .review-card, .faq-item, .contacts-card, .map-card'
  ));

  if (!prefersReduced && 'IntersectionObserver' in window && revealTargets.length) {
    document.documentElement.classList.add('reveal-ready');
    revealTargets.forEach((el, idx) => {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--reveal-delay', `${(idx % 4) * 45}ms`);
    });

    const markRevealed = (el, obs) => {
      if (el.classList.contains('is-revealed')) return;
      el.classList.add('is-revealed');
      if (obs) obs.unobserve(el);
      window.setTimeout(() => {
        el.style.removeProperty('--reveal-delay');
      }, 650);
    };

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        markRevealed(entry.target, obs);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 100px 0px' });

    revealTargets.forEach((el) => revealObserver.observe(el));

    // Страховка при быстром скролле и прямых прыжках по якорным ссылкам (всё выше и в зоне экрана сразу видно)
    const revealPassedOrVisible = () => {
      const vh = window.innerHeight || 800;
      revealTargets.forEach((el) => {
        if (el.classList.contains('is-revealed')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh + 120) {
          markRevealed(el, revealObserver);
        }
      });
    };

    window.addEventListener('scroll', revealPassedOrVisible, { passive: true });
    window.addEventListener('hashchange', () => window.setTimeout(revealPassedOrVisible, 60));
    window.setTimeout(revealPassedOrVisible, 250);
  }

  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const scrollToTopSmooth = () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    if (location.hash) {
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch (_) {}
    }
  };

  // Возврат в самое начало сайта по логотипу слева в шапке и бренду в футере
  const brandTopBtn = document.getElementById('brandTopBtn');
  if (brandTopBtn) {
    brandTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setMobileMenuOpen(false);
      scrollToTopSmooth();
    });
  }

  document.querySelectorAll('[data-scroll-top]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTopSmooth();
    });
  });

  if (scrollTopBtn) {
    const toggleScrollTop = () => {
      scrollTopBtn.hidden = window.scrollY < 520;
    };
    window.addEventListener('scroll', toggleScrollTop, { passive: true });
    scrollTopBtn.addEventListener('click', scrollToTopSmooth);
    toggleScrollTop();
  }
})();
