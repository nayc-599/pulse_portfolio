// Shared, cross-page behaviour: mounting every LED pixel grid on the page,
// and the journal reading-progress bar (present only on post pages).

import { mountPixelGrids } from './pixel-grid.js';

mountPixelGrids();

const progressFill = document.querySelector('[data-reading-progress]');
if (progressFill) {
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
    progressFill.style.width = (p * 100).toFixed(1) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Light/dark switch. The <head> script has already applied the saved choice
// or the system setting; this keeps the switch in step, saves a choice when
// it's made, and follows the system while no choice has been saved.
const THEME_KEY = 'pulse-theme';
const root = document.documentElement;
const switchEl = document.querySelector('[data-theme-switch]');
const isDark = () => root.classList.contains('theme-device');
function setTheme(dark) {
  if (dark === isDark()) return;
  root.classList.toggle('theme-device', dark);
  window.dispatchEvent(new CustomEvent('pulse:themechange', { detail: { dark } }));
  sync();
}
function sync() { if (switchEl) switchEl.setAttribute('aria-checked', String(isDark())); }
sync();
if (switchEl) {
  switchEl.addEventListener('click', () => {
    const dark = !isDark();
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* not saved: fine */ }
    setTheme(dark);
  });
}
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const follow = (e) => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch { /* none */ }
    if (!saved) setTheme(e.matches);
  };
  if (mq.addEventListener) mq.addEventListener('change', follow);
}
