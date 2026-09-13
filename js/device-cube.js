// Project page device cube: scroll-linked rotation, and a static face
// rendered once via the shared pixel-grid primitives.

import { makeGrid, paint, face } from './pixel-grid.js';

const root = document.querySelector('.device-cube');
if (root) {
  const cube = root.querySelector('.device-cube__cube');
  const faceGridEl = root.querySelector('.device-cube__face');

  const g = makeGrid(faceGridEl, 18, true);
  if (g) {
    face(g, { dx: 0, dy: 0, blink: 0, flat: 0 });
    paint(g, g.buf, 1);
  }

  if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    const onScroll = () => {
      const r = root.getBoundingClientRect();
      const span = window.innerHeight + r.height;
      const t = Math.max(0, Math.min(1, (window.innerHeight - r.top) / span));
      cube.style.transform = 'rotateX(-14deg) rotateY(' + (-60 + t * 110).toFixed(2) + 'deg)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
}
