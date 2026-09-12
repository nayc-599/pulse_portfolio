// Home page hero: wake-on-input, blink, idle, and mouse-tracking face.
// Builds on the shared pixel-grid primitives rather than re-implementing them.

import { makeGrid, paint, face, clamp, lerp } from './pixel-grid.js';

const root = document.querySelector('.hero');
if (root) {
  const gridEl = root.querySelector('.hero__grid');
  const copyEl = root.querySelector('.hero__copy');
  const glowEl = root.querySelector('.hero__glow');
  const cueEl = root.querySelector('.hero__cue');

  const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grid = makeGrid(gridEl, 24, true);

  const state = {
    blink: 1, blinkAt: 0, blinking: 0,
    bright: 0.30, brightT: 0.30,
    mouse: { cx: 0, cy: 0 },
    eye: { x: 0, y: 0, tx: 0, ty: 0 },
    awake: false,
    lastInput: Date.now(),
    time: 0,
    heroCell: null,
  };

  function fitHero() {
    if (!grid || !gridEl) return;
    const hdr = document.querySelector('header');
    const hh = hdr ? Math.round(hdr.getBoundingClientRect().height) : 0;
    const avail = Math.max(360, window.innerHeight - hh);
    root.style.minHeight = avail + 'px';
    root.style.paddingTop = (avail < 620 ? 30 : 48) + 'px';
    root.style.paddingBottom = (avail < 620 ? 96 : 132) + 'px';

    const cell = clamp(Math.floor((avail * 0.42 - 46) / 24), 6, 11);
    if (cueEl) {
      const rule = cueEl.lastElementChild;
      if (rule) rule.style.height = (avail < 620 ? 28 : 46) + 'px';
      cueEl.style.bottom = (avail < 620 ? 26 : 36) + 'px';
    }
    if (state.heroCell === cell) return;
    state.heroCell = cell;
    gridEl.style.gridTemplateColumns = 'repeat(24, ' + cell + 'px)';
    gridEl.style.gridAutoRows = cell + 'px';
    if (copyEl) copyEl.style.marginTop = (cell < 10 ? 30 : 56) + 'px';
    if (glowEl) {
      const sz = Math.round(460 * (cell / 11));
      glowEl.style.width = sz + 'px';
      glowEl.style.height = sz + 'px';
    }
  }

  function wake() {
    if (state.awake) return;
    state.awake = true;
    state.brightT = 1;
    if (copyEl) copyEl.style.opacity = '1';
  }

  function frame() {
    const now = Date.now();
    state.time += 1 / 60;
    const idle = state.awake && (now - state.lastInput > 30000);

    if (now > state.blinkAt) { state.blinking = 1; state.blinkAt = now + 4000 + Math.random() * 4000; }
    if (state.blinking > 0) { state.blinking -= 1 / 14; if (state.blinking < 0) state.blinking = 0; }

    const closed = idle || !state.awake;
    const target = closed ? 1 : Math.sin(clamp(state.blinking, 0, 1) * Math.PI);
    state.blink = lerp(state.blink, target, closed ? 0.05 : 0.35);

    if (grid && grid.el) {
      const rect = grid.el.getBoundingClientRect();
      const dx = (state.mouse.cx - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const dy = (state.mouse.cy - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      state.eye.tx = clamp(dx * 2.2, -2, 2);
      state.eye.ty = clamp(dy * 1.6, -1.5, 1.5);
    }
    state.eye.x = lerp(state.eye.x, state.eye.tx, 0.35);
    state.eye.y = lerp(state.eye.y, state.eye.ty, 0.35);

    const breath = 0.5 + 0.5 * Math.sin(state.time * 2 * Math.PI / 10);
    state.brightT = !state.awake ? 0.30 : idle ? 0.34 : 0.86 + 0.14 * breath;
    state.bright = lerp(state.bright, state.brightT, 0.05);

    face(grid, { dx: state.eye.x, dy: state.eye.y, blink: state.blink, flat: 0 });
    paint(grid, grid.buf, state.bright);

    if (glowEl) glowEl.style.opacity = (state.awake ? (idle ? 0.32 : 0.55 + breath * 0.45) : 0.22).toFixed(3);
    if (cueEl) cueEl.style.opacity = (state.awake ? 0.45 + breath * 0.4 : 0.25).toFixed(3);
  }

  fitHero();
  window.addEventListener('resize', fitHero);

  if (rm) {
    state.awake = true; state.bright = 1; state.blink = 0;
    face(grid, { dx: 0, dy: 0, blink: 0, flat: 0 });
    paint(grid, grid.buf, 1);
    if (copyEl) copyEl.style.opacity = '1';
    if (glowEl) glowEl.style.opacity = '0.6';
    if (cueEl) cueEl.style.opacity = '0.7';
  } else {
    const onAny = () => { state.lastInput = Date.now(); wake(); };
    const onMove = (e) => { state.lastInput = Date.now(); wake(); state.mouse.cx = e.clientX; state.mouse.cy = e.clientY; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onAny, { passive: true });
    window.addEventListener('keydown', onAny);
    setTimeout(wake, 4500);

    const loop = () => { frame(); requestAnimationFrame(loop); };
    frame();
    requestAnimationFrame(loop);
  }
}
