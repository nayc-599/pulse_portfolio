// Full-size viewer for figures outside the Media page (the Project page's
// dashboard screenshots). Any [data-figure-full] button opens it; buttons
// inside one [data-figure-group] step with the arrows. Same lightbox
// styles as the Media viewer: the whole image, uncropped, caption and meta
// underneath. Escape closes, focus returns to the button that opened it.

const buttons = [...document.querySelectorAll('[data-figure-full]')];
if (buttons.length) {
  const viewer = document.createElement('div');
  viewer.className = 'lightbox figure-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-labelledby', 'figure-viewer-caption');
  viewer.hidden = true;
  viewer.innerHTML = `
    <div class="lightbox__bar">
      <span class="figure-viewer__meta" data-count aria-live="polite"></span>
      <button type="button" class="link-on-dark link-on-dark--underline lightbox__close" data-close>Close<span class="lightbox__close-key"> (Esc)</span></button>
    </div>
    <div class="lightbox__backdrop" data-backdrop>
      <button type="button" class="lightbox-nav" data-prev aria-label="Previous">←</button>
      <div class="lightbox-stage" data-stage></div>
      <button type="button" class="lightbox-nav" data-next aria-label="Next">→</button>
    </div>
    <div class="lightbox__footer">
      <span id="figure-viewer-caption" class="lightbox__caption" data-caption></span>
      <span class="figure-viewer__meta" data-meta></span>
    </div>`;
  document.body.appendChild(viewer);
  const $ = (s) => viewer.querySelector(s);
  const stage = $('[data-stage]'), cap = $('[data-caption]'), meta = $('[data-meta]'), count = $('[data-count]');
  const prev = $('[data-prev]'), next = $('[data-next]'), closeBtn = $('[data-close]'), backdrop = $('[data-backdrop]');
  const outside = [...document.body.children].filter((n) => n !== viewer && n.tagName !== 'SCRIPT');
  let list = [], index = 0, trigger = null, overflow = '';

  function render() {
    const b = list[index];
    const img = b.querySelector('img');
    const base = b.dataset.figureFull;
    stage.innerHTML = '';
    const pic = document.createElement('picture');
    const src = document.createElement('source');
    src.type = 'image/webp'; src.srcset = base + '.webp';
    const im = document.createElement('img');
    im.src = base + '.jpg'; im.alt = img ? img.alt : '';
    if (img) { im.width = img.width ? img.getAttribute('width') : 0; im.height = img.getAttribute('height'); }
    pic.append(src, im); stage.append(pic);
    cap.textContent = b.dataset.figureCaption || '';
    meta.textContent = b.dataset.figureMeta || '';
    count.textContent = list.length > 1 ? (index + 1) + ' / ' + list.length : '';
    prev.hidden = next.hidden = list.length < 2;
  }
  function open(b) {
    const group = b.closest('[data-figure-group]');
    list = group ? [...group.querySelectorAll('[data-figure-full]')] : [b];
    index = Math.max(0, list.indexOf(b));
    trigger = b;
    overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    outside.forEach((n) => { n.inert = true; });
    viewer.hidden = false;
    render();
    closeBtn.focus();
  }
  function close() {
    viewer.hidden = true;
    stage.innerHTML = '';
    outside.forEach((n) => { n.inert = false; });
    document.body.style.overflow = overflow;
    if (trigger) trigger.focus();
  }
  const step = (d) => { if (list.length > 1) { index = (index + d + list.length) % list.length; render(); } };
  buttons.forEach((b) => b.addEventListener('click', () => open(b)));
  closeBtn.addEventListener('click', close);
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'Tab') {
      const f = [...viewer.querySelectorAll('button')].filter((n) => !n.hidden);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
}
