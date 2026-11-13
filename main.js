/* =====================================================
   NAJAH MADANI — MAIN.JS
   Theme toggle · Cursor · Navigation · Magnetic · Tilt
   ===================================================== */

(() => {
  // ---------- 2. THEME TOGGLE ----------
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const STORAGE_KEY = 'najah_theme';

  // Apply saved theme on load
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
  root.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);

    // Smooth color transition flash
    root.style.transition = 'background 0.6s var(--ease), color 0.6s var(--ease)';
  });

  // ---------- 2.5. LANGUAGE TOGGLE — all pages ----------
  // Translate against the untouched English source, not the previously translated
  // Arabic DOM; this avoids missing labels and corrupt text after repeated toggles.
  const langToggle = document.getElementById('langToggle');
  // Declared before the initial language pass, so there is no TDZ error.
  let moreProjects = null, moreButton = null, moreLabel = null;
  const AR = window.NAJAH_AR || {};
  const LANGUAGE_KEY = 'najah_lang';
  const normalize = s => s.replace(/\s+/g, ' ').trim();
  const originalTitle = document.title;
  const heroTitle = document.querySelector('.hero-title');
  const heroTitleEnglish = heroTitle?.innerHTML;
  const heroTitleArabic = '<span class="title-line"><span class="title-text">أصمم</span></span><span class="title-line"><span class="title-text italic">تجارب رقمية</span></span><span class="title-line"><span class="title-text gradient-text">تتمحور حول الإنسان.</span></span>';
  const translatable = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      const parent = node.parentNode;
      if (parent && ['SCRIPT','STYLE','NOSCRIPT'].includes(parent.nodeName)) return NodeFilter.FILTER_REJECT;
      if (parent?.closest?.('.hero-title')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const en = node.nodeValue;
    if (AR[normalize(en)]) translatable.push({ node, en });
  }
  const labels = Array.from(document.querySelectorAll('img[alt], a[aria-label], button[aria-label]')).map(el=>({el,alt:el.getAttribute('alt'),aria:el.getAttribute('aria-label')}));
  function setLanguage(lang) {
    const ar = lang === 'ar';
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', ar);
    translatable.forEach(({node,en})=>{
      const trim = normalize(en);
      const leading = (en.match(/^\s*/) || [''])[0];
      const trailing = (en.match(/\s*$/) || [''])[0];
      node.nodeValue = ar ? leading + AR[trim] + trailing : en;
    });
    labels.forEach(({el,alt,aria})=>{
      if (alt !== null && AR[normalize(alt)]) el.setAttribute('alt',ar?AR[normalize(alt)]:alt);
      if (aria !== null && AR[normalize(aria)]) el.setAttribute('aria-label',ar?AR[normalize(aria)]:aria);
    });
    if (heroTitle) heroTitle.innerHTML = ar ? heroTitleArabic : heroTitleEnglish;
    document.title = ar ? (AR[normalize(originalTitle)] || originalTitle) : originalTitle;
    langToggle?.setAttribute('aria-label', ar ? 'Switch to English' : 'التبديل إلى العربية');
    const choice = langToggle?.querySelector('.lang-current');
    if (choice) choice.textContent = ar ? 'English' : 'العربية';
    if (typeof refreshProjectsToggleText === 'function') refreshProjectsToggleText();
  }
  let savedLang = 'en';
  try { savedLang = localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en'; } catch (_) {}
  setLanguage(savedLang);
  langToggle?.addEventListener('click',()=>{
    const next = document.documentElement.lang === 'ar' ? 'en' : 'ar';
    setLanguage(next);
    try {localStorage.setItem(LANGUAGE_KEY,next);}catch(_){}
  });

  // ---------- 2.6. EXPAND PROJECTS IN PLACE ----------
  moreProjects = document.getElementById('additionalProjects');
  moreButton = document.getElementById('toggleMoreProjects');
  moreLabel = document.getElementById('projectsToggleLabel');
  function refreshProjectsToggleText() {
    if (!moreButton || !moreLabel) return;
    const expanded = moreButton.getAttribute('aria-expanded') === 'true';
    const ar = document.documentElement.lang === 'ar';
    // Keep the original text node intact so the general language toggle can still work.
    const value = ar
      ? (expanded ? 'عرض مشاريع أقل' : 'عرض المزيد من المشاريع')
      : (expanded ? 'Show Less Projects' : 'Show More Projects');
    if (moreLabel.firstChild?.nodeType === Node.TEXT_NODE) moreLabel.firstChild.nodeValue = value;
    else moreLabel.textContent = value;
    const ico = moreButton.querySelector('i');
    if (ico) ico.className = expanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
  }
  moreButton?.addEventListener('click', () => {
    const expanding = moreProjects.hidden;
    moreProjects.hidden = !expanding;
    moreButton.setAttribute('aria-expanded', String(expanding));
    refreshProjectsToggleText();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    // Scroll to the newly revealed cards, or back to the button after collapse.
    requestAnimationFrame(() => {
      const target = expanding ? moreProjects : moreButton;
      const offset = (document.getElementById('nav')?.offsetHeight || 0) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });
  refreshProjectsToggleText();

  // ---------- 3. CUSTOM CURSOR ----------
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let cursorX = 0, cursorY = 0;
  let ringX = 0, ringY = 0;

  if (cursorDot && cursorRing && window.matchMedia('(min-width: 761px)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorDot.style.left = cursorX + 'px';
      cursorDot.style.top = cursorY + 'px';
    });

    function animateRing() {
      ringX += (cursorX - ringX) * 0.16;
      ringY += (cursorY - ringY) * 0.16;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const hoverSelectors = 'a, button, .project-card, .contact-card, .skill-card, .about-card, .btn, [data-magnetic], [data-tilt]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        cursorDot.classList.add('is-hover');
        cursorRing.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        cursorDot.classList.remove('is-hover');
        cursorRing.classList.remove('is-hover');
      }
    });
  } else {
    cursorDot?.remove();
    cursorRing?.remove();
  }

  // ---------- 4. NAV SCROLL STATE & BACK TO TOP ----------
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');
  let lastY = 0;

  if (nav || toTop) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (nav) nav.classList.toggle('is-scrolled', y > 80);
      if (toTop) toTop.classList.toggle('is-visible', y > 600);
      lastY = y;
    });
  }

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- 5. MOBILE MENU ----------
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  menuBtn?.addEventListener('click', () => {
    menuBtn.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open');
  });

  // Close mobile menu when a link is clicked
  mobileMenu?.querySelectorAll('a')?.forEach(a => {
    a.addEventListener('click', () => {
      menuBtn.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
    });
  });

  // ---------- 6. MAGNETIC BUTTONS ----------
  const magneticStrength = 0.32;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ---------- 7. 3D TILT CARD ----------
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const inner = el.querySelector('.tilt-card-inner') || el;
    let flipped = false;
    el.addEventListener('mousemove', (e) => {
      if (flipped) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 18;
      const ry = (x - 0.5) * 18;
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      if (flipped) return;
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
    el.addEventListener('click', () => {
      flipped = !flipped;
      el.classList.toggle('is-flipped', flipped);
    });
  });

  // ---------- 8. SMOOTH SCROLL FOR NAV LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length <= 1) return;
      // Let the browser follow the real #projects anchor. Its scroll-margin-top
      // keeps the section header visible below the sticky navigation and lets
      // anchor positioning stay correct if fonts or images change page height.
      if (href === '#projects') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 0) + 18;
      // Use the real section top, not a section animation / transition position.
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });

  // ---------- 9. PROJECT CARD CLICK → SCROLL TO DETAIL ----------
  const projectsRail = document.getElementById('projectsRail');
  projectsRail?.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;
    const id = card.dataset.project;
    const detail = document.getElementById('pdetail-' + id);
    if (detail) {
      const offset = nav ? nav.offsetHeight : 0;
      const top = detail.getBoundingClientRect().top + window.scrollY - offset - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  // Add hover lift on cards (handled by CSS but we add for parallax)
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-10px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---------- 10. COUNTER ANIMATION FOR HERO META ----------
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let cur = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = target; return; }
          el.textContent = cur;
          requestAnimationFrame(tick);
        };
        tick();
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  // ---------- 11. KEYBOARD SHORTCUT FOR THEME ----------
  window.addEventListener('keydown', (e) => {
    if (e.key === 't' && !e.target.matches('input, textarea')) {
      themeToggle?.click();
    }
  });

  // ---------- 12. PARALLAX HERO ON MOUSE MOVE ----------
  const heroContent = document.querySelector('.hero-content');
  const hero3d = document.querySelector('.hero-3d-scene');
  if (heroContent && hero3d && window.matchMedia('(min-width: 980px)').matches) {
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
      hero3d.style.transform = `translate(${x * 18}px, ${y * 18}px)`;
    });
    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      heroContent.style.transform = '';
      hero3d.style.transform = '';
    });
  }
})();
