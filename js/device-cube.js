// Device cube (partials/device-cube.njk), used on the Project page and the
// home page: scroll-linked rotation, and a static face rendered once via the
// shared pixel-grid primitives.
//
// Each cube initialises lazily: its face is only built when it first comes
// near the viewport, and its rotation only updates while it is on screen.
// With reduced motion the cube stays on its static resting angle.

import { makeGrid, paint, face } from './pixel-grid.js';

const roots = [...document.querySelectorAll('.device-cube')];
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const visible = new Set();

function init(root) {
  if (root.dataset.cubeReady) return;
  root.dataset.cubeReady = 'true';
  const g = makeGrid(root.querySelector('.device-cube__face'), 18, true);
  if (g) {
    face(g, { dx: 0, dy: 0, blink: 0, flat: 0 });
    paint(g, g.buf, 1);
  }
}

function rotate(root) {
  const r = root.getBoundingClientRect();
  const span = window.innerHeight + r.height;
  const t = Math.max(0, Math.min(1, (window.innerHeight - r.top) / span));
  root.querySelector('.device-cube__cube').style.transform =
    'rotateX(-14deg) rotateY(' + (-60 + t * 110).toFixed(2) + 'deg)';
}

let frame = 0;
function onScroll() {
  if (frame || !visible.size) return;          // nothing on screen: no work
  frame = requestAnimationFrame(() => {
    frame = 0;
    visible.forEach(rotate);
  });
}

if (roots.length) {
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            init(e.target);
            visible.add(e.target);
            if (!reduceMotion) rotate(e.target);
          } else {
            visible.delete(e.target);
          }
        });
      }, { rootMargin: '200px 0px' })
    : null;

  roots.forEach((root) => (io ? io.observe(root) : (init(root), visible.add(root))));

  if (!reduceMotion) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
}
