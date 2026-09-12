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
