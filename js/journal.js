// Journal index: category filter chips. Entries are rendered server-side
// from the posts collection; this only toggles visibility + the count label.

const chips = document.querySelectorAll('.filter-chip[data-filter]');
const entries = document.querySelectorAll('.journal-entry');
const featured = document.querySelector('.journal-featured');
const countEl = document.querySelector('[data-entry-count]');
const total = entries.length;

function applyFilter(type) {
  entries.forEach((li) => {
    li.hidden = type !== 'ALL' && li.dataset.category !== type;
  });
  if (featured) {
    featured.hidden = type !== 'ALL' && featured.dataset.category !== type;
  }
  if (countEl) {
    if (type === 'ALL') {
      countEl.textContent = 'ALL ENTRIES · ' + total;
    } else {
      const visible = Array.from(entries).filter((li) => !li.hidden).length;
      countEl.textContent = type + ' · ' + visible + (visible === 1 ? ' ENTRY' : ' ENTRIES');
    }
  }
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    applyFilter(chip.dataset.filter);
  });
});

applyFilter('ALL');
