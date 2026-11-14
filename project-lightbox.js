/* Project image viewer: stays on the detail page, with accessible controls. */
(() => {
  const galleries = document.querySelectorAll('.pd-gallery');
  if (!galleries.length) return;

  const viewer = document.createElement('div');
  viewer.className = 'pd-lightbox';
  viewer.hidden = true;
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Project image gallery');
  viewer.innerHTML = `
    <div class="pd-lightbox__panel">
      <button class="pd-lightbox__close" type="button" aria-label="Close image viewer">&times;</button>
      <div class="pd-lightbox__stage">
        <button class="pd-lightbox__nav pd-lightbox__prev" type="button" aria-label="Previous image">&#8249;</button>
        <img class="pd-lightbox__image" alt="" decoding="async" />
        <button class="pd-lightbox__nav pd-lightbox__next" type="button" aria-label="Next image">&#8250;</button>
      </div>
      <div class="pd-lightbox__footer">
        <p class="pd-lightbox__caption" dir="auto"></p>
        <span class="pd-lightbox__count" aria-live="polite" aria-atomic="true"></span>
      </div>
    </div>
  `;
  document.body.appendChild(viewer);

  const photo = viewer.querySelector('.pd-lightbox__image');
  const caption = viewer.querySelector('.pd-lightbox__caption');
  const count = viewer.querySelector('.pd-lightbox__count');
  const closeBtn = viewer.querySelector('.pd-lightbox__close');
  const prevBtn = viewer.querySelector('.pd-lightbox__prev');
  const nextBtn = viewer.querySelector('.pd-lightbox__next');
  let images = [];
  let current = 0;
  let previousFocus = null;
  let originalOverflow = '';

  const isArabic = () => document.documentElement.lang === 'ar';
  const translateControls = () => {
    const ar = isArabic();
    viewer.setAttribute('aria-label', ar ? 'معرض صور المشروع' : 'Project image gallery');
    closeBtn.setAttribute('aria-label', ar ? 'إغلاق الصورة' : 'Close image viewer');
    prevBtn.setAttribute('aria-label', ar ? 'الصورة السابقة' : 'Previous image');
    nextBtn.setAttribute('aria-label', ar ? 'الصورة التالية' : 'Next image');
    count.textContent = ar ? `صورة ${current + 1} من ${images.length}` : `${current + 1} / ${images.length}`;
  };

  const preloadNeighbor = index => {
    if (images.length < 2) return;
    const neighbor = images[(index + 1) % images.length];
    const preload = new Image();
    preload.src = neighbor.src;
  };

  const show = index => {
    if (!images.length) return;
    current = (index + images.length) % images.length;
    const item = images[current];
    photo.src = item.src;
    photo.alt = item.alt;
    caption.textContent = item.alt;
    translateControls();
    preloadNeighbor(current);
  };

  const open = (gallery, clickedLink) => {
    images = Array.from(gallery.querySelectorAll('a[href]')).map(link => ({
      link,
      src: link.href,
      alt: link.querySelector('img')?.alt || ''
    }));
    const index = images.findIndex(item => item.link === clickedLink);
    if (index < 0) return;
    previousFocus = document.activeElement;
    originalOverflow = document.body.style.overflow;
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    const multiple = images.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
    show(index);
    closeBtn.focus();
  };

  const close = () => {
    if (viewer.hidden) return;
    viewer.hidden = true;
    photo.removeAttribute('src');
    document.body.style.overflow = originalOverflow;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    images = [];
    previousFocus = null;
  };

  document.addEventListener('click', event => {
    const link = event.target.closest?.('.pd-gallery a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link.closest('.pd-gallery'), link);
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));
  viewer.addEventListener('click', event => {
    if (event.target === viewer) close();
  });

  document.addEventListener('keydown', event => {
    if (viewer.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowLeft' && images.length > 1) { event.preventDefault(); show(current - 1); }
    else if (event.key === 'ArrowRight' && images.length > 1) { event.preventDefault(); show(current + 1); }
    else if (event.key === 'Tab') {
      const controls = [closeBtn, prevBtn, nextBtn].filter(btn => !btn.hidden);
      const focused = controls.indexOf(document.activeElement);
      if (event.shiftKey && focused <= 0) { event.preventDefault(); controls[controls.length - 1].focus(); }
      else if (!event.shiftKey && (focused === controls.length - 1 || focused === -1)) { event.preventDefault(); controls[0].focus(); }
    }
  });

  let startX = null;
  let startY = null;
  viewer.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { startX = null; return; }
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  viewer.addEventListener('touchend', event => {
    if (viewer.hidden || startX === null || images.length < 2 || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;
    startX = null;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  viewer.addEventListener('touchcancel', () => { startX = null; }, { passive: true });

  new MutationObserver(translateControls).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
