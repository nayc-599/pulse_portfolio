// Home page hero: wake-on-input, blink, idle, and mouse-tracking face.
// Builds on the shared pixel-grid primitives rather than re-implementing them.
//
// On the first visit of a browser session (and only without reduced
// motion), the face arrives through the cube intro in hero-cube.js: a
// shutter opens onto a beating dot cube, which turns and settles into the
// face, awake. Every other load shows the resting face directly, asleep
// until the first input as before.

import { makeGrid, paint, face, clamp, lerp } from './pixel-grid.js';
import { createCubeIntro, INTRO_SECONDS } from './hero-cube.js';

const INTRO_KEY = 'pulse:hero-intro-played';

// True the first time it is asked in a browser session. If sessionStorage
// is unavailable (blocked site data, some private modes) we cannot tell a
// first visit from a reload, so the intro is skipped rather than replayed
// on every page load.
function firstVisitThisSession() {
  try {
    if (window.sessionStorage.getItem(INTRO_KEY)) return false;
    window.sessionStorage.setItem(INTRO_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

// hero.js used to step by a fixed 1/60 per frame, which slows on low-fps
// devices. It now steps by real elapsed time; this rescales a per-frame
// lerp fraction to match, so at a steady 60fps nothing changes.
const follow = (k, dt) => 1 - Math.pow(1 - k, dt * 60);

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
    lastTs: 0,
    heroCell: null,
  };

  let intro = !rm && grid && firstVisitThisSession() ? createCubeIntro(root, grid) : null;
  let introState = null;

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
    if (state.heroCell !== cell) {
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
    // The shutter covers the whole section, so it follows any resize.
    if (intro) intro.resize(cell);
  }

  function wake() {
    if (state.awake) return;
    state.awake = true;
    state.brightT = 1;
    if (copyEl) copyEl.style.opacity = '1';
  }

  function frame(ts) {
    const now = Date.now();
    const dt = state.lastTs ? clamp((ts - state.lastTs) / 1000, 0, 0.1) : 1 / 60;   // capped so a background tab doesn't jump
    state.lastTs = ts;
    state.time += dt;
    const idle = state.awake && (now - state.lastInput > 30000);

    if (now > state.blinkAt) { state.blinking = 1; state.blinkAt = now + 4000 + Math.random() * 4000; }
    if (state.blinking > 0) { state.blinking -= dt * 60 / 14; if (state.blinking < 0) state.blinking = 0; }

    const closed = idle || !state.awake;
    const target = closed ? 1 : Math.sin(clamp(state.blinking, 0, 1) * Math.PI);
    state.blink = lerp(state.blink, target, follow(closed ? 0.05 : 0.35, dt));

    // Measured before the intro writes 576 cell styles this frame; reading
    // it after them would force a relayout of all of them.
    if (grid && grid.el) {
      const rect = grid.el.getBoundingClientRect();
      const dx = (state.mouse.cx - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const dy = (state.mouse.cy - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      state.eye.tx = clamp(dx * 2.2, -2, 2);
      state.eye.ty = clamp(dy * 1.6, -1.5, 1.5);
    }
    // Until the cube has landed the gaze is held centred: tracked eyes reach
    // grid columns 4-5 and 18-19, which are cube side-face dots, not the
    // front face the face lands from.
    const holdGaze = intro && !(introState && introState.landed);
    state.eye.x = lerp(state.eye.x, holdGaze ? 0 : state.eye.tx, follow(0.35, dt));
    state.eye.y = lerp(state.eye.y, holdGaze ? 0 : state.eye.ty, follow(0.35, dt));

    const breath = 0.5 + 0.5 * Math.sin(state.time * 2 * Math.PI / 10);
    state.brightT = !state.awake ? 0.30 : idle ? 0.34 : 0.86 + 0.14 * breath;
    state.bright = lerp(state.bright, state.brightT, follow(0.05, dt));

    face(grid, { dx: state.eye.x, dy: state.eye.y, blink: state.blink, flat: 0 });

    let glowOp = state.awake ? (idle ? 0.32 : 0.55 + breath * 0.45) : 0.22;
    let cueOp = state.awake ? 0.45 + breath * 0.4 : 0.25;
    if (intro) {
      introState = intro.frame(ts, state.bright);
      const { pulse, landed, finished, glowMul, reveal } = introState;
      if (landed) {
        paint(grid, grid.buf, state.bright * (1 + 0.16 * pulse));
        gridEl.style.transform = pulse > 0.001 ? 'scale(' + (1 + 0.02 * pulse).toFixed(4) + ')' : '';
      }
      if (reveal > 0 && copyEl && copyEl.style.opacity !== '1') copyEl.style.opacity = '1';
      glowOp = clamp(glowOp * glowMul * (1 + 0.6 * pulse), 0, 1);
      cueOp *= reveal;
      if (glowEl) glowEl.style.transform = 'translate(-50%,-50%)' + (pulse > 0.001 ? ' scale(' + (1 + 0.06 * pulse).toFixed(4) + ')' : '');
      if (finished) { intro = null; gridEl.style.transform = ''; }
    } else {
      paint(grid, grid.buf, state.bright);
    }

    if (glowEl) glowEl.style.opacity = glowOp.toFixed(3);
    if (cueEl) cueEl.style.opacity = cueOp.toFixed(3);
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

    if (intro) {
      // The intro's face lands awake: eyes open, full resting brightness,
      // no blink until the beat has died away. The copy is revealed as it
      // lands, not on wake(), so input during the intro can't show it early.
      state.awake = true;
      state.blink = 0;
      state.brightT = state.bright = 0.93;
      state.blinkAt = Date.now() + INTRO_SECONDS * 1000 + 4000 + Math.random() * 4000;
    } else {
      setTimeout(wake, 4500);
    }

    // One frame now, as before, so the first paint is the face (or the
    // closed shutter) rather than an empty grid.
    const loop = (ts) => { frame(ts); requestAnimationFrame(loop); };
    frame(performance.now());
    requestAnimationFrame(loop);
  }
}
