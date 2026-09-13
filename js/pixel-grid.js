// Pixel Grid - the LED display primitive used everywhere on the site
// (header/footer wordmark, hero face, device cube, decorative motifs,
// avatars). This is the ONE copy: every page imports from here instead
// of re-implementing makeGrid/paint/face.

// Read straight from tokens.css rather than duplicating the values here,
// so the LED colours stay defined in exactly one place.
function cssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export const AMBER = cssVar('--amber', '#F5C86B');
export const AMBER_DIM = cssVar('--amber-dim', '#8A7043');
export const AMBER_RGB = cssVar('--amber-rgb', '245, 200, 107');
export const EASE = cssVar('--ease', 'cubic-bezier(0.37,0,0.63,1)');

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function makeGrid(el, n, glow) {
  if (!el || el.dataset.built) return null;
  el.dataset.built = '1';
  const cells = [];
  for (let i = 0; i < n * n; i++) {
    const d = document.createElement('span');
    d.style.cssText =
      'display:block;width:100%;height:100%;border-radius:1px;background:' +
      AMBER_DIM +
      ';opacity:.12;transition:opacity .22s ' +
      EASE +
      ',background-color .22s ' +
      EASE;
    el.appendChild(d);
    cells.push(d);
  }
  return { el, n, cells, prev: new Float32Array(n * n), buf: new Float32Array(n * n), glow: glow !== false };
}

export function paint(g, buf, bright) {
  if (!g) return;
  const cells = g.cells, prev = g.prev;
  for (let i = 0; i < cells.length; i++) {
    const v = clamp(buf[i] * bright, 0, 1);
    if (Math.abs(v - prev[i]) < 0.015) continue;
    prev[i] = v;
    const c = cells[i];
    if (v > 0.05) {
      c.style.backgroundColor = AMBER;
      c.style.opacity = v.toFixed(2);
      c.style.boxShadow = g.glow ? '0 0 ' + (7 * v).toFixed(1) + 'px rgba(' + AMBER_RGB + ',' + (0.5 * v).toFixed(2) + ')' : 'none';
    } else {
      c.style.backgroundColor = AMBER_DIM;
      c.style.opacity = '0.12';
      c.style.boxShadow = 'none';
    }
  }
}

export function face(g, opts) {
  const n = g.n, buf = g.buf;
  buf.fill(0);
  const set = (x, y, v) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    const i = y * n + x;
    if (v > buf[i]) buf[i] = v;
  };
  const s = n / 24;
  const eyeR = Math.max(1, Math.round(1 * s));
  const cy = 8 * s + (opts.dy || 0) * s;
  const flat = opts.flat || 0;
  const blink = clamp(opts.blink || 0, 0, 1);
  const open = Math.round(eyeR * (1 - blink));

  for (const cxBase of [7 * s, 16 * s]) {
    const cx = cxBase + (opts.dx || 0) * s;
    for (let ex = -eyeR; ex <= eyeR; ex++)
      for (let ey = -open; ey <= open; ey++)
        set(cx + ex, cy + ey, 1);
  }

  const x0 = 6 * s, x1 = 17 * s, span = x1 - x0;
  for (let x = x0; x <= x1; x += 1) {
    const t = span === 0 ? 0 : (x - x0) / span;
    const ySmile = 14 * s + 2.4 * s * Math.sin(Math.PI * t);
    const yFlat = 15.2 * s;
    const y = lerp(ySmile, yFlat, flat);
    const yf = Math.floor(y), fr = y - yf;
    set(x, yf, 1 - fr * 0.55);
    if (fr > 0.15) set(x, yf + 1, fr);
  }
}

// 5x5 wordmark face - hand-plotted, too small for face()
export function tinyFace(g, blinkClosed, dx, dy) {
  const buf = g.buf;
  buf.fill(0);
  const set = (x, y, v) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < 5 && y < 5) buf[y * 5 + x] = v; };
  if (!blinkClosed) { set(1 + dx, 1 + dy, 1); set(3 + dx, 1 + dy, 1); }
  else { set(1, 1, 0.5); set(3, 1, 0.5); }
  set(1, 3, 1); set(2, 3.4, 1); set(3, 3, 1);
}

// Mirrored pseudo-random bitmap, used for avatar/category motifs
export function staticPattern(g, seed) {
  const n = g.n, buf = g.buf;
  buf.fill(0);
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < Math.ceil(n / 2); x++) {
      const v = rnd() > 0.52 ? 0.55 + rnd() * 0.45 : 0;
      buf[y * n + x] = v;
      buf[y * n + (n - 1 - x)] = v;
    }
  }
}

export function geometricPattern(g, p) {
  const n = g.n, buf = g.buf;
  buf.fill(0);
  const put = (x, y, v) => { if (x >= 0 && y >= 0 && x < n && y < n) buf[y * n + x] = v === undefined ? 1 : v; };
  const c = (n - 1) / 2;
  if (p === 'lattice') {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (x % 3 === 0 || y % 3 === 0) put(x, y);
  } else if (p === 'ring') {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const d = Math.abs(Math.hypot(x - c, y - c) - n * 0.36);
      if (d < 1) put(x, y, 1 - d * 0.5);
    }
  } else if (p === 'staircase') {
    for (let i = 0; i < n; i++) { put(i, n - 1 - i); put(i, n - i); }
  } else if (p === 'iris') {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - c, y - c);
      if (d < n * 0.16) put(x, y);
      else { const e = Math.abs(d - n * 0.42); if (e < 1) put(x, y, 1 - e * 0.5); }
    }
  } else {
    staticPattern(g, p === 'scatter' ? 8321 : 4177);
  }
}

// Mounts every [data-pixel-grid] element on the page: decorative motifs,
// avatars, and the small tracking wordmark in the header/footer. The hero
// face and device cube have their own bespoke loops (hero.js, device-cube.js)
// built on the same primitives above, since they need extra state this
// generic mounter doesn't cover.
export function mountPixelGrids(root = document) {
  root.querySelectorAll('[data-pixel-grid]').forEach(mountOne);
}

function mountOne(el) {
  const cellsEl = el.querySelector('.pixel-grid__cells');
  if (!cellsEl) return;
  const n = Number(el.dataset.n || 11);
  const pattern = el.dataset.pattern || 'face';
  const live = el.dataset.live === 'true';
  const g = makeGrid(cellsEl, n, true);
  if (!g) return;

  const rm = prefersReducedMotion();
  const state = { blink: 0, blinkAt: 0, blinking: 0, glance: 0, mouse: { cx: 0, cy: 0 }, mdx: 0, mdy: 0 };
  const track = live && !rm && n <= 5;

  const render = () => {
    if (pattern === 'face' || pattern === 'neutral' || pattern === 'asleep') {
      const closed = pattern === 'asleep' ? 1 : state.blink;
      if (n <= 5) {
        tinyFace(g, closed > 0.55, Math.round(state.mdx || 0), Math.round(state.mdy || 0));
      } else {
        face(g, { dx: state.glance, dy: 0, blink: closed, flat: pattern === 'neutral' ? 1 : 0 });
      }
    } else {
      geometricPattern(g, pattern);
    }
    paint(g, g.buf, 1);
  };

  render();
  if (rm || !live) return;

  if (track) {
    window.addEventListener('pointermove', (e) => {
      state.mouse.cx = e.clientX;
      state.mouse.cy = e.clientY;
      const tx = clamp((state.mouse.cx / window.innerWidth - 0.5) * 2.4, -1, 1);
      const ty = clamp((state.mouse.cy / window.innerHeight - 0.5) * 1.4, -1, 1);
      state.mdx = lerp(state.mdx, tx, 0.35);
      state.mdy = lerp(state.mdy, ty, 0.35);
    }, { passive: true });
  } else {
    el.addEventListener('mouseenter', () => {
      state.glance = Math.random() > 0.5 ? 1 : -1;
      clearTimeout(state.glanceTimer);
      state.glanceTimer = setTimeout(() => { state.glance = 0; }, 900);
    });
  }

  state.blinkAt = Date.now() + 4000 + Math.random() * 4000;
  const loop = () => {
    const now = Date.now();
    if (now > state.blinkAt) { state.blinking = 1; state.blinkAt = now + 4000 + Math.random() * 4000; }
    if (state.blinking > 0) { state.blinking -= 1 / 14; if (state.blinking < 0) state.blinking = 0; }
    state.blink = lerp(state.blink, Math.sin(clamp(state.blinking, 0, 1) * Math.PI), 0.35);
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
