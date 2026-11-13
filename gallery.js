/* Loads optional project images. Missing images are skipped silently. */
(() => {
  const EXTS = ['png', 'jpg', 'jpeg', 'webp'];

  const load = (base, cb) => {
    let i = 0;
    const next = () => {
      if (i >= EXTS.length) return cb(null);
      const url = encodeURI(base + '.' + EXTS[i++]);
      const img = new Image();
      img.onload = () => cb(url);
      img.onerror = next;
      img.src = url;
    };
    next();
  };

  // Card covers on the homepage / more-projects
  document.querySelectorAll('[data-cover]').forEach((el) => {
    load(el.dataset.cover, (url) => {
      if (!url) return;
      el.innerHTML = '<img src="' + url + '" alt="" loading="lazy" />';
      el.hidden = false;
    });
  });

  // Galleries on project pages
  document.querySelectorAll('.pd-gallery').forEach((box) => {
    const wrap = box.closest('.pd-gallery-wrap');
    let bases;
    if (box.dataset.bases) {
      bases = box.dataset.bases.split('|');
    } else {
      const max = parseInt(box.dataset.max || '8', 10);
      bases = Array.from({ length: max }, (_, i) => box.dataset.gallery + '/' + (i + 1));
    }
    const found = new Array(bases.length);
    let pending = bases.length;
    bases.forEach((base, idx) => {
      load(base, (url) => {
        found[idx] = url;
        if (--pending > 0) return;
        const urls = found.filter(Boolean);
        if (!urls.length) return;
        box.innerHTML = urls.map((u, k) =>
          '<a href="' + u + '" target="_blank" rel="noopener"><img src="' + u +
          '" alt="Project screenshot ' + (k + 1) + '" loading="lazy" /></a>').join('');
        if (wrap) wrap.hidden = false;
      });
    });
  });
})();
