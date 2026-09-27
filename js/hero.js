// Home page hero: wake-on-input, blink, idle, and mouse-tracking face.
// Builds on the shared pixel-grid primitives rather than re-implementing them.
//
// When someone arrives at the home page fresh, or reloads it (and only
// without reduced motion), the face arrives through the cube intro in
// hero-cube.js: a shutter opens onto a beating dot cube, which turns and
// settles into the face, awake. Coming from another page on the site, or
// back/forward, shows the resting face directly, asleep until the first
// input as before.

import { makeGrid, paint, face, clamp, lerp } from './pixel-grid.js';
import { createCubeIntro, INTRO_SECONDS } from './hero-cube.js';

// Whether this load of the page should play the intro:
//   reload                               play
//   back/forward                         skip
//   navigate, no referrer                play (typed, bookmarked, new tab)
//   navigate, referrer on another site   play (arriving from a link elsewhere)
//   navigate, referrer on this site      skip (e.g. from Project or Journal)
// A page restored from the back/forward cache never re-runs this script;
// that case is handled by the pageshow listener below.
function introWanted() {
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const type = nav ? nav.type : 'navigate';
  if (type === 'reload') return true;
  if (type === 'back_forward') return false;
  const ref = document.referrer;
  if (!ref) return true;
  try {
    return new URL(ref).origin !== window.location.origin;
  } catch {
    return true;
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
    glowSize: 460,
  };

  let intro = !rm && grid && introWanted() ? createCubeIntro(root, grid) : null;
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
        state.glowSize = sz;
        glowEl.style.width = sz + 'px';
        glowEl.style.height = sz + 'px';
      }
    }
    // The shutter covers the whole section, so it follows any resize.
    if (intro) intro.resize(cell);
  }

  // The glow sits on the grid's centre, not at a fixed share of the section
  // (the copy below the grid pushes it above the section's middle), offset
  // by (ox, oy) while the cube's silhouette is off-centre. Its heartbeat
  // scale pivots on the grid's centre, the point the cube pumps around and
  // the grid scales about once the face has landed, so all three share one
  // origin. The rects are passed in, measured before any style writes.
  function placeGlow(gridRect, rootRect, ox, oy, scale) {
    if (!glowEl) return;
    const half = state.glowSize / 2;
    const gx = gridRect.left - rootRect.left + gridRect.width / 2;
    const gy = gridRect.top - rootRect.top + gridRect.height / 2;
    glowEl.style.left = (gx + ox - half).toFixed(1) + 'px';
    glowEl.style.top = (gy + oy - half).toFixed(1) + 'px';
    glowEl.style.transformOrigin = (half - ox).toFixed(1) + 'px ' + (half - oy).toFixed(1) + 'px';
    glowEl.style.transform = scale !== 1 ? 'scale(' + scale.toFixed(4) + ')' : 'none';
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
    let rect = null, rootRect = null;
    if (grid && grid.el) {
      rect = grid.el.getBoundingClientRect();
      rootRect = root.getBoundingClientRect();
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
    let glowX = 0, glowY = 0, glowScale = 1;
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
      glowX = introState.cx; glowY = introState.cy;
      if (pulse > 0.001) glowScale = 1 + 0.06 * pulse;
      if (finished) { intro = null; introState = null; gridEl.style.transform = ''; }
    } else {
      paint(grid, grid.buf, state.bright);
    }

    if (rect) placeGlow(rect, rootRect, glowX, glowY, glowScale);
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
    // No frame loop here, so place the glow now and again whenever the
    // layout can shift: on resize, and once web fonts have set the copy.
    const placeStatic = () => { if (gridEl) placeGlow(gridEl.getBoundingClientRect(), root.getBoundingClientRect(), 0, 0, 1); };
    placeStatic();
    window.addEventListener('resize', placeStatic);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeStatic);
  } else {
    const onAny = () => { state.lastInput = Date.now(); wake(); };
    const onMove = (e) => { state.lastInput = Date.now(); wake(); state.mouse.cx = e.clientX; state.mouse.cy = e.clientY; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onAny, { passive: true });
    window.addEventListener('keydown', onAny);

    // Back/forward from the bfcache resumes this page exactly as it was
    // left, possibly mid-intro, without re-running this script. Show the
    // resting face instead of resuming the intro where it stopped.
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted || !intro) return;
      intro.skip();
      intro = null;
      introState = null;
      gridEl.style.transform = '';
      if (copyEl) copyEl.style.opacity = '1';
      if (cueEl) cueEl.style.opacity = '';
      state.blinkAt = Date.now() + 4000 + Math.random() * 4000;
    });

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
