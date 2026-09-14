// Media page: type filter chips + a single shared lightbox instance.
// Opening any item always replaces whatever the lightbox currently shows —
// there is exactly one dialog in the DOM, reused for every item and media
// type, and it is fully re-rendered (media reset, then re-populated) on
// every open and every prev/next step.

const chips = document.querySelectorAll('.filter-chip[data-filter]');
const items = document.querySelectorAll('.media-item');
const groups = document.querySelectorAll('.media-group');

function applyFilter(type) {
  items.forEach((li) => {
    li.hidden = type !== 'ALL' && li.dataset.type !== type;
  });
  groups.forEach((g) => {
    const anyVisible = Array.from(g.querySelectorAll('.media-item')).some((li) => !li.hidden);
    g.hidden = !anyVisible;
  });
}

const dialog = document.querySelector('.lightbox');
const typeEl = dialog.querySelector('[data-lightbox-type]');
const imageEl = dialog.querySelector('[data-lightbox-image]');
const videoEl = dialog.querySelector('[data-lightbox-video]');
const slotEl = dialog.querySelector('[data-lightbox-slot]');
const captionEl = dialog.querySelector('[data-lightbox-caption]');
const closeBtn = dialog.querySelector('[data-lightbox-close]');
const prevBtn = dialog.querySelector('[data-lightbox-prev]');
const nextBtn = dialog.querySelector('[data-lightbox-next]');
const backdrop = dialog.querySelector('[data-lightbox-backdrop]');

// Everything at the top level of <body> except the lightbox itself gets
// `inert` while it's open: the header can't be tabbed or clicked into,
// and the page can't scroll behind the overlay.
const inertTargets = Array.from(document.body.children).filter((el) => el !== dialog);

let currentBtn = null;
let triggerBtn = null;
let bodyOverflow = '';

function groupButtons(btn) {
  const group = btn.closest('.media-group') || document;
  return Array.from(group.querySelectorAll('.media-item:not([hidden]) .media-item__open'));
}

function focusableElements() {
  return Array.from(dialog.querySelectorAll('button, video, [href], [tabindex]:not([tabindex="-1"])'))
    .filter((el) => !el.hidden && el.offsetParent !== null);
}

function renderLightbox(btn) {
  currentBtn = btn;
  videoEl.pause();
  videoEl.hidden = true;
  videoEl.removeAttribute('src');
  videoEl.load();
  imageEl.hidden = true;

  dialog.setAttribute('aria-label', btn.dataset.caption);
  typeEl.textContent = btn.dataset.type + ' · ' + btn.dataset.date;
  captionEl.textContent = btn.dataset.caption;

  const src = btn.dataset.src;
  slotEl.hidden = Boolean(src);
  slotEl.textContent = btn.dataset.slot;
  if (src && btn.dataset.mediaType === 'video') {
    videoEl.src = src;
    videoEl.hidden = false;
  } else if (src) {
    imageEl.src = src;
    imageEl.alt = btn.dataset.caption || '';
    imageEl.hidden = false;
  }

  const list = groupButtons(btn);
  const hasMultiple = list.length > 1;
  prevBtn.hidden = !hasMultiple;
  nextBtn.hidden = !hasMultiple;
}

function openLightbox(btn) {
  if (!dialog.hidden) {
    // Already open: just swap the content, never stack a second instance.
    renderLightbox(btn);
    return;
  }
  triggerBtn = btn;
  bodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  inertTargets.forEach((el) => { el.inert = true; });
  dialog.hidden = false;
  renderLightbox(btn);
  closeBtn.focus();
}

function step(delta) {
  if (!currentBtn) return;
  const list = groupButtons(currentBtn);
  if (list.length < 2) return;
  const idx = list.indexOf(currentBtn);
  renderLightbox(list[(idx + delta + list.length) % list.length]);
}

function closeLightbox() {
  if (dialog.hidden) return;
  videoEl.pause();
  dialog.hidden = true;
  document.body.style.overflow = bodyOverflow;
  inertTargets.forEach((el) => { el.inert = false; });
  currentBtn = null;
  if (triggerBtn) {
    triggerBtn.focus();
    triggerBtn = null;
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    applyFilter(chip.dataset.filter);
    closeLightbox();
  });
});

document.querySelectorAll('.media-item__open').forEach((btn) => {
  btn.addEventListener('click', () => openLightbox(btn));
});

closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', () => step(-1));
nextBtn.addEventListener('click', () => step(1));

// Click on the dimmed area (not the stage or the nav arrows) closes it.
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeLightbox();
});

window.addEventListener('keydown', (e) => {
  if (dialog.hidden) return;
  if (e.key === 'Escape') {
    closeLightbox();
    return;
  }
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'Tab') {
    const focusable = focusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
