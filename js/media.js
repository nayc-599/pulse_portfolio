// Media page: filter chips (linkable via the URL hash) and the full-size viewer.
// No library. Items come from the JSON that media.html embeds from
// _data/media.json; the viewer only loads an item's full-size file when opened.

const data = JSON.parse(document.getElementById('media-data').textContent);
const byId = Object.fromEntries(data.map((it) => [it.id, it]));

// ---------------------------------------------------------------- filters
const chips = [...document.querySelectorAll('.media-filters .filter-chip')];
const sections = [...document.querySelectorAll('.media-section[data-group]')];
const groups = new Set(chips.map((c) => c.dataset.filter).filter((f) => f !== 'all'));
let current = 'all';

function applyFilter(filter, { updateHash = false } = {}) {
  current = groups.has(filter) ? filter : 'all';
  chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === current)));
  sections.forEach((s) => {
    s.hidden = current !== 'all' && s.dataset.group !== current;
    s.classList.toggle('is-uncapped', current !== 'all');   // a filtered group shows in full
  });
  if (updateHash) {
    const url = current === 'all' ? location.pathname + location.search : '#' + current;
    history.replaceState(null, '', url);
  }
}

chips.forEach((chip) => chip.addEventListener('click', () => applyFilter(chip.dataset.filter, { updateHash: true })));

// "Show all (n)" / "Show fewer": reveals the capped items in place.
document.querySelectorAll('.media-section__more').forEach((btn) => {
  btn.addEventListener('click', () => {
    const section = btn.closest('.media-section');
    const open = section.classList.toggle('is-expanded');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Show fewer' : 'Show all (' + btn.dataset.count + ')';
  });
});
window.addEventListener('hashchange', () => applyFilter(location.hash.slice(1)));
if (location.hash) applyFilter(location.hash.slice(1));

// ---------------------------------------------------------------- viewer
const viewer = document.querySelector('.media-viewer');
const stage = viewer.querySelector('[data-viewer-stage]');
const countEl = viewer.querySelector('[data-viewer-count]');
const captionEl = viewer.querySelector('[data-viewer-caption]');
const weekEl = viewer.querySelector('[data-viewer-week]');
const pdfEl = viewer.querySelector('[data-viewer-pdf]');
const closeBtn = viewer.querySelector('[data-viewer-close]');
const prevBtn = viewer.querySelector('[data-viewer-prev]');
const nextBtn = viewer.querySelector('[data-viewer-next]');
const backdrop = viewer.querySelector('[data-viewer-backdrop]');
const outside = [...document.body.children].filter((el) => el !== viewer && el.tagName !== 'SCRIPT');

let list = [];        // the open buttons in view under the current filter
let index = -1;
let trigger = null;
let bodyOverflow = '';

// Arrows move through the gallery tiles under the current filter. The featured
// photo isn't part of the gallery count, so it opens on its own.
function visibleButtons() {
  return [...document.querySelectorAll('.media-section:not([hidden]) [data-viewer-item]')];
}

function el(tag, attrs = {}) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v !== undefined && v !== null) node.setAttribute(k, v); });
  return node;
}

function render() {
  const it = byId[list[index].dataset.viewerItem];
  stage.replaceChildren();
  if (it.type === 'video') {
    const video = el('video', {
      controls: '', playsinline: '', muted: '', preload: 'metadata',
      poster: it.poster + '-full.jpg', 'aria-label': it.caption,
      controlslist: 'nodownload noremoteplayback', disablepictureinpicture: '',
    });
    video.muted = true;
    video.append(el('source', { src: it.src + '.webm', type: 'video/webm' }),
                 el('source', { src: it.src + '.mp4', type: 'video/mp4' }));
    stage.append(video);
    video.play().catch(() => {});   // muted, so browsers allow it; controls are there either way
  } else if (it.svg) {
    stage.append(el('img', { src: it.src, alt: it.alt, width: it.width, height: it.height }));
  } else {
    const pic = el('picture');
    pic.append(el('source', { srcset: it.src + '-full.webp', type: 'image/webp' }),
               el('img', { src: it.src + '-full.jpg', alt: it.alt, width: it.width, height: it.height }));
    stage.append(pic);
  }
  const people = it.type === 'video' && it.people && it.people.length ? ' Shows ' + it.people.join(' and ') + '.' : '';
  captionEl.textContent = it.caption + people;
  weekEl.textContent = (it.type === 'video' ? 'VIDEO ' + it.duration + ', ' : '') + 'WK ' + it.week;
  countEl.textContent = list.length > 1 ? index + 1 + ' / ' + list.length : '';
  pdfEl.hidden = !it.pdf;
  if (it.pdf) {
    pdfEl.href = it.pdf;
    pdfEl.textContent = 'Download the poster (PDF' + (it.pdfSize ? ', ' + it.pdfSize : '') + ')';
  }
  const many = list.length > 1;
  prevBtn.hidden = !many;
  nextBtn.hidden = !many;
}

function open(button) {
  list = visibleButtons();
  index = list.indexOf(button);
  if (index < 0) { list = [button]; index = 0; }
  trigger = button;
  bodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  outside.forEach((node) => { node.inert = true; });
  viewer.hidden = false;
  render();
  closeBtn.focus();
}

function close() {
  stage.querySelectorAll('video').forEach((v) => v.pause());
  stage.replaceChildren();
  viewer.hidden = true;
  outside.forEach((node) => { node.inert = false; });
  document.body.style.overflow = bodyOverflow;
  if (trigger) trigger.focus();
}

function step(delta) {
  if (list.length < 2) return;
  stage.querySelectorAll('video').forEach((v) => v.pause());
  index = (index + delta + list.length) % list.length;
  render();
}

document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-viewer-item]');
  if (button && viewer.hidden) open(button);
});
closeBtn.addEventListener('click', close);
prevBtn.addEventListener('click', () => step(-1));
nextBtn.addEventListener('click', () => step(1));
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

viewer.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.preventDefault(); close(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  else if (e.key === 'Tab') {
    // keep focus inside the dialog
    const focusables = [...viewer.querySelectorAll('button, a[href], video[controls]')].filter((n) => !n.hidden && n.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// Swipe left/right on touch screens.
let touchX = null;
let touchY = null;
backdrop.addEventListener('touchstart', (e) => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });
backdrop.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  touchX = touchY = null;
}, { passive: true });
