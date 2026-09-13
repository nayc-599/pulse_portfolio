// Media page: type filter chips + lightbox. The lightbox always operates
// on the currently-visible (filtered) set of items, matching the original
// behaviour of resetting to closed whenever the filter changes.

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
const stageEl = dialog.querySelector('[data-lightbox-stage]');
const slotEl = dialog.querySelector('[data-lightbox-slot]');
const captionEl = dialog.querySelector('[data-lightbox-caption]');
const closeBtn = dialog.querySelector('[data-lightbox-close]');
const prevBtn = dialog.querySelector('[data-lightbox-prev]');
const nextBtn = dialog.querySelector('[data-lightbox-next]');

let currentIndex = -1;

function visibleButtons() {
  return Array.from(document.querySelectorAll('.media-item:not([hidden]) .media-item__open'));
}

function renderLightbox() {
  const list = visibleButtons();
  const btn = list[currentIndex];
  if (!btn) {
    dialog.hidden = true;
    return;
  }
  dialog.hidden = false;
  dialog.setAttribute('aria-label', btn.dataset.caption);
  typeEl.textContent = btn.dataset.type + ' · ' + btn.dataset.date;
  stageEl.style.aspectRatio = btn.dataset.ratio;
  slotEl.textContent = btn.dataset.slot;
  captionEl.textContent = btn.dataset.caption;
}

function openAt(btn) {
  currentIndex = visibleButtons().indexOf(btn);
  renderLightbox();
}

function step(delta) {
  const list = visibleButtons();
  if (!list.length) return;
  currentIndex = (currentIndex + delta + list.length) % list.length;
  renderLightbox();
}

function closeLightbox() {
  currentIndex = -1;
  dialog.hidden = true;
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    applyFilter(chip.dataset.filter);
    closeLightbox();
  });
});

document.querySelectorAll('.media-item__open').forEach((btn) => {
  btn.addEventListener('click', () => openAt(btn));
});

closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', () => step(-1));
nextBtn.addEventListener('click', () => step(1));

window.addEventListener('keydown', (e) => {
  if (dialog.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});
