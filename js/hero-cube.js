// Home page hero intro: a shutter opens onto a beating, rocking dot cube,
// which turns to face you and settles into the resting face. Driven by
// hero.js, which owns the resting loop (eyes, blinks, breathing) and hands
// this module the face buffer every frame; this module only moves and
// styles the grid's own cells until they land, then gives them back.
//
// How it works: the 576 dots ARE the 576 cells that makeGrid() builds for
// the face. Each cell is placed on the surface of a cube with a CSS
// transform, so every dot owns exactly one grid cell. The Turn eases each
// transform back to none, at which point the cell is sitting in its own
// slot and paint() takes over. Nothing is crossfaded or respawned. The
// shutter is one canvas laid over the hero section.
//
// Tuned in preview/hero-cube.SCRATCH.html (not deployed), which has sliders
// for the rocking, heartbeat and shimmer. The live intro has since been
// shortened and sped up; the tunables are the named constants just below.

import { clamp, lerp, AMBER, AMBER_DIM, AMBER_RGB } from './pixel-grid.js';

// ---- Tune these ----
// false: no thinking stage. The shutter opens straight onto the glide and
// the Turn, with no hold, no heartbeat and no sparks; everything else (the
// shutter, the glide, the Turn, the glow) is unchanged. true: the full
// rocking-and-heartbeat hold before the glide.
const ENABLE_HEARTBEAT = false;
const BPM = 96;                          // heartbeat: one lub-dub every 60/96 = 0.625s
const HOLD_BEATS = 3;                    // the cube thinks at screen centre for exactly this many
                                          // complete lub-dub cycles, back to back, then moves on
const MOVE_SECONDS = 0.7;                // then glides up into the face's place over this long
// --------------------

const N = 24;
const TAU = Math.PI * 2;

const AP = 0.9;                          // the shutter opens over 0.9s
const D = 2.2;                           // the Turn
const BEAT = 60 / BPM;
const ROCK_DEG = 25;                     // yaw sway, +/- degrees
const ROCK_PERIOD = 6;                   // one left-right-left swing per 6s (independent of the heart)
const SWAY_PERIOD = ROCK_PERIOD / 1.618; // pitch sway, a golden-ratio period so the two never line up
const PITCH0 = 14 * Math.PI / 180;       // fixed downward look so the top face shows
const SWAY = 3.5 * Math.PI / 180;        // pitch sway on top of that
const CUBE_SIZE = 1.1;                   // cube half-width, in half-widths of the 12-cell front block
const FOCAL = 6;                         // camera distance, in cube half-widths

// Heartbeat shape. The lub-dub was tuned at 40bpm; every time in it is
// scaled by BEAT_SCALE, so a faster heart keeps the same shape, just quicker.
const BEAT_SCALE = BEAT / 1.5;
const DUB = 0.17 * BEAT_SCALE;           // the dub lands this long after the lub (0.094s at 72bpm)
const DUB_GAIN = 0.55;                   // and is this much softer
const PUSH = 0.06;                       // radial push, in cube half-widths (3% of its size)
const RIPPLE = 0.075 * BEAT_SCALE;       // seconds of delay per cube half-width from the front face's centre
// Shimmer and sparks.
const SHIMMER_LIGHT = 0.16;              // +/- brightness
const SHIMMER_POS = 0.012;               // +/- position, in cube half-widths (about 1px)
const SPARK_GAIN = 0.55;                 // extra opacity at a spark's peak
// The dots' glow during the intro is ONE drop-shadow filter on the whole
// grid, not a box-shadow per dot. 576 per-dot blurred shadows, restyled
// every frame, were what made the rocking stutter (about 28fps in Chrome);
// promoting each dot to its own layer instead cost as much again in layer
// bookkeeping. One shared filter keeps 60fps even with the CPU slowed 4x.
const BLOOM_ALPHA = 0.5;
const bloom = (a) => (a > 0.004 ? 'drop-shadow(0 0 4px rgba(' + AMBER_RGB + ',' + a.toFixed(3) + '))' : '');

/* ---------------------------------------------------------------------
   Timeline, in seconds from the first frame (defaults in brackets):
     0 .. AP             the shutter opens at screen centre [0 - 0.9]
     AP .. H             the cube thinks at screen centre: HOLD_BEATS complete
                         lub-dub cycles, back to back, at a constant pace [0.9 - 2.775]
     H                   the HOLD_BEATS-th lub lands exactly here: the glide starts on it
     H .. TURN           the glide up into the face's place [2.775 - 3.475]
     TURN .. SETTLE      the Turn, in place; the hero content fades in [3.475 - 5.675]
     TURN + D/2 .. END   the beat decays over about one beat as the face
                         lands, leaving the breathing underneath [4.575 - 6.3]

   The heart's phase is linear in t and anchored at AP, so the hold's first
   lub lands the moment the cube appears (t = AP) and every later one lands
   exactly BEAT seconds after the last, with no acceleration: the HOLD_BEATS-
   th lub falls precisely on H = AP + HOLD_BEATS * BEAT by construction, and
   the transition happens the instant it does, whatever BPM or HOLD_BEATS
   are. The same constant-rate phase carries on past H, so the beat already
   visible at the Turn continues at that pace while beatAmp() fades it out.
   --------------------------------------------------------------------- */
const H = AP + (ENABLE_HEARTBEAT ? HOLD_BEATS * BEAT : 0);
const TURN = H + MOVE_SECONDS;
const SETTLE = TURN + D;
const END = ENABLE_HEARTBEAT ? SETTLE + BEAT : SETTLE;   // with no beat there is nothing left to decay
export const INTRO_SECONDS = END;        // from the first frame until the beat has fully decayed

const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.trim().slice(i, i + 2), 16));
// Small seeded PRNG: fixed shimmer phases, and a fresh spark plan per play.
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const RGB_AMBER = hex(AMBER);
const RGB_SPARK = [255, 238, 196];       // a spark warms dots towards a paler, hotter amber

// Counts whole beats since AP: an integer exactly at every lub, so the
// HOLD_BEATS-th one coincides exactly with H (see the timeline above).
function heartPhase(t) {
  return (t - AP) / BEAT;
}
// Seconds since the most recent lub.
function sinceLub(t) {
  const ph = heartPhase(t);
  return (ph - Math.floor(ph)) * BEAT;
}
function beatAmp(t) {
  if (!ENABLE_HEARTBEAT) return 0;
  const a = TURN + 0.5 * D;
  if (t <= a) return 1;
  if (t >= END) return 0;
  return 0.5 + 0.5 * Math.cos(Math.PI * (t - a) / (END - a));
}

/* Heartbeat envelopes, both zero before their onset (times at 40bpm,
   scaled by BEAT_SCALE).
   push   a damped spring: a sharp rise to 1 at ~50ms, then an elastic
          return with one small inward overshoot (about -0.25), gone by ~0.5s.
   light  an alpha function: sharp attack peaking at 60ms, smooth decay. */
const SPRING_T = 0.26 * BEAT_SCALE, SPRING_DECAY = 0.11 * BEAT_SCALE, LIGHT_T = 0.06 * BEAT_SCALE;
const springRaw = (s) => Math.exp(-s / SPRING_DECAY) * Math.sin(TAU * s / SPRING_T);
let SPRING_NORM = 0;
for (let s = 0; s < SPRING_T; s += 0.0002) SPRING_NORM = Math.max(SPRING_NORM, springRaw(s));
const pushEnv = (s) => (s <= 0 ? 0 : springRaw(s) / SPRING_NORM);
const lightEnv = (s) => (s <= 0 ? 0 : (s / LIGHT_T) * Math.exp(1 - s / LIGHT_T));
const lubDub = (env, s) => env(s) + DUB_GAIN * env(s - DUB);

/* ---------------------------------------------------------------------
   Cell-to-cube assignment. Unit cube, x right, y up, z towards the
   viewer; every cell gets a fixed point (BX, BY, BZ) on its surface. It is
   the cube's net laid over the grid, so each dot's home cell sits next to
   where its face lands when the cube faces front:

     rows 0-5    [ back TL | TOP    | back TR ]
     rows 6-17   [ LEFT    | FRONT  | RIGHT   ]
     rows 18-23  [ back BL | BOTTOM | back BR ]
                  cols 0-5   6-17     18-23

   FRONT  12x12, cols 6-17 x rows 6-17. Holds every pixel face() lights
          at rest (cols 6-17, rows 7-17), so the face lands entirely from
          the front face. Tracked eyes reach cols 4-19, which is why
          hero.js holds the gaze centred until the cube has landed.
   TOP / BOTTOM / LEFT / RIGHT  12x6 each: the four arms of the cross, at
          the front's spacing along the shared edge and half density in
          depth, from the front edge (next to the front block) to the back
          edge (at the grid's outer border).
   BACK   12x12, from the four 6x6 corner blocks, each one the back
          face's quadrant on the same side.

   144 + 4*72 + 144 = 576, one dot per cell. No flight crosses the stage:
   front dots move at most 2.5 cells, side dots about 3 (at most 6), and
   back dots about 9 out to their corner, faded out for the whole trip.
   Front and back dots are inset half a step from the edges and side dots
   half a depth step from the front and back planes, so no dot sits on an
   edge on top of another face's dot.
   --------------------------------------------------------------------- */
const FRONT = 0, BACK = 1, SIDE = 2;
const BX = new Float32Array(N * N), BY = new Float32Array(N * N), BZ = new Float32Array(N * N);
const FACE = new Uint8Array(N * N);
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
  const i = r * N + c;
  const midC = c >= 6 && c <= 17, midR = r >= 6 && r <= 17;
  const across = (c - 5.5) / 6 - 1;      // cols 6-17 -> -11/12 .. 11/12
  const down = 1 - (r - 5.5) / 6;        // rows 6-17 -> 11/12 .. -11/12
  if (midC && midR) {
    FACE[i] = FRONT; BX[i] = across; BY[i] = down; BZ[i] = 1;
  } else if (midC) {                     // top (rows 0-5) or bottom (rows 18-23)
    FACE[i] = SIDE; BX[i] = across;
    BY[i] = r < 6 ? 1 : -1;
    BZ[i] = ((r < 6 ? r : 23 - r) + 0.5) / 3 - 1;
  } else if (midR) {                     // left (cols 0-5) or right (cols 18-23)
    FACE[i] = SIDE; BY[i] = down;
    BX[i] = c < 6 ? -1 : 1;
    BZ[i] = ((c < 6 ? c : 23 - c) + 0.5) / 3 - 1;
  } else {                               // corner blocks -> back quadrants
    FACE[i] = BACK;
    BX[i] = ((c < 6 ? c : c - 12) + 0.5) / 6 - 1;
    BY[i] = 1 - ((r < 6 ? r : r - 12) + 0.5) / 6;
    BZ[i] = -1;
  }
}

/* Per-dot constants for the living cube.
   RX/RY/RZ  unit direction from the cube's centre: the heartbeat pushes along it.
   DELAY     ripple delay, by 3D distance from the centre of the front face,
             so each beat starts there and travels back over the cube.
   FID       which plane the dot is on, for the face sparks.
   SF/SP     smooth-noise frequencies (0.2-0.7Hz) and phases, so each dot's
             shimmer drifts on its own instead of flickering. */
const RX = new Float32Array(N * N), RY = new Float32Array(N * N), RZ = new Float32Array(N * N);
const DELAY = new Float32Array(N * N);
const F_FRONT = 0, F_TOP = 2;
const FID = new Uint8Array(N * N);
const SF = new Float32Array(N * N * 5), SP = new Float32Array(N * N * 5);
{
  const rnd = mulberry32(576);
  for (let i = 0; i < N * N; i++) {
    const len = Math.hypot(BX[i], BY[i], BZ[i]);
    RX[i] = BX[i] / len; RY[i] = BY[i] / len; RZ[i] = BZ[i] / len;
    DELAY[i] = RIPPLE * Math.hypot(BX[i], BY[i], BZ[i] - 1);
    FID[i] = FACE[i] === FRONT ? F_FRONT : FACE[i] === SIDE && BY[i] === 1 ? F_TOP : 255;
    for (let k = 0; k < 5; k++) { SF[i * 5 + k] = TAU * (0.2 + 0.5 * rnd()); SP[i * 5 + k] = TAU * rnd(); }
  }
}

// Sparks only use the front and top faces and their seven edges: the
// downward look keeps those in view, and a spark anywhere else is lost
// behind the cube.
const EDGES = [];
for (let axis = 0; axis < 3; axis++) for (const a of [-1, 1]) for (const b of [-1, 1]) {
  const s = [0, 0, 0], e = [0, 0, 0];
  const o = [0, 1, 2].filter((k) => k !== axis);
  s[o[0]] = e[o[0]] = a; s[o[1]] = e[o[1]] = b;
  s[axis] = -1; e[axis] = 1;
  if ((s[2] === 1 && e[2] === 1) || (s[1] === 1 && e[1] === 1)) EDGES.push([s, e]);
}
const SPARK_FACES = [[F_FRONT, [0, 1]], [F_TOP, [0, 2]]];

// One every 1.7-2.7s while the cube is thinking, each 0.75-0.95s long:
// a point of light running an edge, or a soft band sweeping a face.
function planSparks(rnd) {
  const out = [];
  for (let s = AP + 0.5; s < H - 0.7; s += 1.7 + rnd()) {
    const dur = 0.75 + 0.2 * rnd();
    if (rnd() < 0.6) {
      const [a, b] = EDGES[Math.floor(rnd() * EDGES.length)];
      const flip = rnd() < 0.5;
      out.push({ kind: 'edge', t0: s, dur, from: flip ? b : a, to: flip ? a : b });
    } else {
      const [fid, axes] = SPARK_FACES[Math.floor(rnd() * SPARK_FACES.length)];
      out.push({ kind: 'face', t0: s, dur, fid, axis: axes[rnd() < 0.5 ? 0 : 1], dir: rnd() < 0.5 ? 1 : -1 });
    }
  }
  return out;
}
function liveSparks(sparks, t) {
  const out = [];
  for (const sp of sparks) {
    const u = (t - sp.t0) / sp.dur;
    if (u <= 0 || u >= 1) continue;
    const env = Math.sin(Math.PI * u);
    const along = lerp(-0.15, 1.15, u);
    if (sp.kind === 'edge') {
      out.push({ kind: 'edge', env, x: lerp(sp.from[0], sp.to[0], along), y: lerp(sp.from[1], sp.to[1], along), z: lerp(sp.from[2], sp.to[2], along) });
    } else {
      out.push({ kind: 'face', env, fid: sp.fid, axis: sp.axis, pos: sp.dir * lerp(-1.3, 1.3, u) });
    }
  }
  return out;
}

// paint()'s value-to-style mapping, so a dot can take on what paint() will
// draw once it lands. Keep in step with pixel-grid.js.
const RGB_AMBER_DIM_CSS = AMBER_DIM;
function landedLook(v) {
  if (v > 0.05) {
    const q = Math.round(v * 20) / 20;       // quantised, so a landed dot is restyled rarely
    return { key: 'L' + q, bg: AMBER, shadow: '0 0 ' + (7 * q).toFixed(1) + 'px rgba(' + AMBER_RGB + ',' + (0.5 * q).toFixed(2) + ')', op: v };
  }
  return { key: 'D', bg: RGB_AMBER_DIM_CSS, shadow: 'none', op: 0.12 };
}

const BLADES = 8;
const SPARK_LEVELS = 3;                      // spark tint steps: colour changes only between these

/* Creates the intro for one hero. root is the .hero section (the shutter
   covers it); grid is its makeGrid() result. Call resize(cell) whenever
   hero.js resizes the grid, and frame(ts, bright) once per frame after
   the face buffer is up to date. frame() returns:
     landed    the cells are back in their slots: paint() owns them now
     finished  the beat has fully decayed: the intro can be dropped
     pulse     the heartbeat as seen at the front face's centre, for the
               glow and, once landed, the face's brightness
     glowMul   how much of the glow the shutter lets out
     reveal    0 -> 1 from the cube's arrival, for the hero's content
     offX/offY where the grid should be translated to, in px (the cube
               starts at screen centre and glides to the grid's place)
     cx, cy    where the cube's silhouette is centred, in px from the
               (translated) grid's centre, so the glow sits behind the cube
   skip() drops the intro at once: cells home, shutter gone.

   Performance: per frame, each dot only has its transform and opacity
   written. Colour, shadow and z-index are written only when they actually
   change: a spark passing, a dot landing, or a dot moving into a different
   depth bucket. The glow is one filter on the grid (see BLOOM_ALPHA). */
export function createCubeIntro(root, grid) {
  const cells = grid.cells;
  const orig = { transition: cells[0].style.transition, radius: cells[0].style.borderRadius };
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const charcoal = getComputedStyle(document.documentElement).getPropertyValue('--charcoal-rgb').trim() || '28, 26, 23';
  const sparks = planSparks(mulberry32((Math.random() * 4294967296) >>> 0));
  const sparkBg = [];
  for (let k = 0; k <= SPARK_LEVELS; k++) { const c = mix3(RGB_AMBER, RGB_SPARK, 0.7 * k / SPARK_LEVELS); sparkBg.push('rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'); }

  // The shutter covers the whole hero section, so its opaque blades (the
  // hero's own charcoal) have no edge inside the view. The hero becomes its
  // own stacking context so neither the shutter nor the dots' depth
  // z-index can draw over the sticky header when the page is scrolled.
  root.style.isolation = 'isolate';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;left:0;top:0;z-index:1000;pointer-events:none';
  root.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let cell = 11, pitch = 13, W = 0, Ht = 0, cx = 0, cy = 0, startX = 0, startY = 0;
  let t0 = null, landed = false, finished = false;
  let silX = 0, silY = 0;

  // Last written look per cell, so unchanged properties are never rewritten.
  const lookKey = new Array(N * N).fill('');
  const zNow = new Int8Array(N * N).fill(-1);

  for (const el of cells) el.style.transition = 'none';   // paint's .22s easing would smear the motion
  let bloomNow = bloom(BLOOM_ALPHA);
  grid.el.style.filter = bloomNow;

  function resize(c) {
    cell = c; pitch = c + 2;
    W = root.clientWidth; Ht = root.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(Ht * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = Ht + 'px';
    // The shutter opens, and the cube first appears, at the centre of the
    // viewport: a fixed point, in the section's coordinates.
    const rr = root.getBoundingClientRect();
    cx = window.innerWidth / 2 - rr.left;
    cy = window.innerHeight / 2 - rr.top;
    // Where the grid sits in the hero layout (offsets ignore transforms),
    // and so how far it must be translated for the cube to start at (cx, cy).
    const gx = grid.el.offsetLeft + grid.el.offsetWidth / 2;
    const gy = grid.el.offsetTop + grid.el.offsetHeight / 2;
    startX = cx - gx; startY = cy - gy;
  }

  // The 8-blade iris, as vector geometry, centred on (cx, cy). The opening is a regular octagon;
  // blade b is the region beyond side b, between the seams that continue
  // sides b-1 and b past their corners. One ease drives both the opening
  // (from 0.8 cells to just past the section's farthest corner) and the
  // rotation. Blade fill is one even-odd path (section minus octagon), so
  // no antialiased seam lets the cube through; tint, seams and the amber
  // rim fade over the last 45%.
  function shutter(p, bright) {
    if (p >= 1) { if (canvas.width) { canvas.width = 0; canvas.height = 0; } return; }
    const e = ease(p);
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, Ht - cy), Math.hypot(W - cx, Ht - cy));
    const Rin = lerp(0.8 * pitch, far + 0.5 * pitch, e);
    const theta = 0.65 * (1 - e);
    const fade = 1 - smoothstep(0.55, 1, p);
    const Rc = Rin / Math.cos(Math.PI / BLADES);
    const L = 2 * far + W + Ht;
    const vx = [], vy = [], ux = [], uy = [];
    for (let b = 0; b < BLADES; b++) {
      const phi = theta + (TAU * b) / BLADES;
      vx.push(cx + Rc * Math.cos(phi + Math.PI / BLADES)); vy.push(cy + Rc * Math.sin(phi + Math.PI / BLADES));
      ux.push(-Math.sin(phi)); uy.push(Math.cos(phi));
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, Ht);

    // Pinhole light under the blades: a soft Gaussian core, sigma 1.1 cells.
    const coreI = clamp((1 - smoothstep(0.15, 0.5, p)) * bright, 0, 1);
    if (coreI > 0.004) {
      const r = 3.3 * pitch;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(' + AMBER_RGB + ',' + coreI.toFixed(3) + ')');
      g.addColorStop(0.35, 'rgba(' + AMBER_RGB + ',' + (0.55 * coreI).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + AMBER_RGB + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }

    ctx.beginPath();
    ctx.rect(0, 0, W, Ht);
    ctx.moveTo(vx[0], vy[0]);
    for (let b = 1; b < BLADES; b++) ctx.lineTo(vx[b], vy[b]);
    ctx.closePath();
    ctx.fillStyle = 'rgb(' + charcoal + ')';
    ctx.fill('evenodd');

    if (fade > 0.004) {
      const reach = 0.5 * Math.min(W, Ht) + 12 * pitch;
      const falloff = (a) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
        g.addColorStop(0, 'rgba(' + AMBER_RGB + ',' + a.toFixed(4) + ')');
        g.addColorStop(0.55, 'rgba(' + AMBER_RGB + ',' + (0.6 * a).toFixed(4) + ')');
        g.addColorStop(1, 'rgba(' + AMBER_RGB + ',0)');
        return g;
      };
      const tint = falloff(0.035 * fade);
      for (let b = 0; b < BLADES; b += 2) {
        const a = (b + BLADES - 1) % BLADES;
        ctx.beginPath();
        ctx.moveTo(vx[a], vy[a]);
        ctx.lineTo(vx[b], vy[b]);
        ctx.lineTo(vx[b] + ux[b] * L, vy[b] + uy[b] * L);
        ctx.lineTo(vx[a] + ux[a] * L, vy[a] + uy[a] * L);
        ctx.closePath();
        ctx.fillStyle = tint;
        ctx.fill();
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = falloff(0.3 * fade);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let b = 0; b < BLADES; b++) { ctx.moveTo(vx[b], vy[b]); ctx.lineTo(vx[b] + ux[b] * L, vy[b] + uy[b] * L); }
      ctx.stroke();
      ctx.shadowColor = 'rgba(' + AMBER_RGB + ',' + (0.6 * fade).toFixed(3) + ')';
      ctx.shadowBlur = 6 * dpr;                   // shadowBlur ignores the transform
      ctx.strokeStyle = 'rgba(' + AMBER_RGB + ',' + (0.9 * fade).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(vx[0], vy[0]);
      for (let b = 1; b < BLADES; b++) ctx.lineTo(vx[b], vy[b]);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  }

  // The cube: thinking, then the Turn. Yaw and pitch sway; at the Turn both
  // are multiplied by an ease-in-out envelope that reaches 0 over the first
  // 55% of it, so the rocking arrives at rest with zero velocity. Front
  // dots then fly home centre-out; back and side dots fade, travel unseen
  // and land as whatever paint() will draw there. On each dot, before
  // rotation: the heartbeat's radial push and light (delayed by distance
  // from the front face's centre, so each beat ripples back over the cube),
  // shimmer, and sparks. Perspective projection, x*f/(f - z).
  function cube(t, bright, tau, amp) {
    const buf = grid.buf;
    const u = clamp((t - TURN) / D, 0, 1);
    const settle = 1 - ease(clamp(u / 0.55, 0, 1));
    const yaw = (ROCK_DEG * Math.PI / 180) * Math.sin(TAU * t / ROCK_PERIOD) * settle;
    const tilt = (PITCH0 + SWAY * Math.sin(TAU * t / SWAY_PERIOD + 1.1)) * settle;
    const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(tilt), sP = Math.sin(tilt);
    const h = 6 * pitch * CUBE_SIZE, f = FOCAL * h;
    const live = liveSparks(sparks, t);

    // The cube's centre always projects onto the grid's centre (that is
    // what the heartbeat pumps around), but with perspective and the
    // downward look its silhouette does not: the nearer corners project
    // larger, so the drawn cube sits up to ~17px low and ~10px to one side.
    // The centre of the eight projected corners is where it looks centred.
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let k = 0; k < 8; k++) {
      const X = (k & 1 ? h : -h), Y = (k & 2 ? h : -h), Z = (k & 4 ? h : -h);
      const xr = X * cY + Z * sY, zr = -X * sY + Z * cY;
      const yr = Y * cP - zr * sP, zp = Y * sP + zr * cP;
      const P = f / (f - zp);
      const px = xr * P, py = -yr * P;
      if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
    }
    silX = (x0 + x1) / 2; silY = (y0 + y1) / 2;

    for (let i = 0; i < N * N; i++) {
      const r = (i / N) | 0, c = i % N;
      const s = tau - DELAY[i];
      const push = amp * lubDub(pushEnv, s);
      const glow = amp * lubDub(lightEnv, s);
      const q = i * 5;
      const n0 = 0.6 * Math.sin(t * SF[q] + SP[q]) + 0.4 * Math.sin(t * SF[q + 1] + SP[q + 1]);
      let spark = 0;
      for (const sp of live) {
        if (sp.kind === 'edge') {
          const dx = BX[i] - sp.x, dy = BY[i] - sp.y, dz = BZ[i] - sp.z;
          spark += sp.env * Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * 0.2 * 0.2));
        } else if (FID[i] === sp.fid) {
          const v = sp.axis === 0 ? BX[i] : sp.axis === 1 ? BY[i] : BZ[i];
          spark += sp.env * Math.exp(-(v - sp.pos) * (v - sp.pos) / (2 * 0.13 * 0.13));
        }
      }
      spark = Math.min(1, spark);

      const X = (BX[i] + RX[i] * PUSH * push + SHIMMER_POS * Math.sin(t * SF[q + 2] + SP[q + 2])) * h;
      const Y = (BY[i] + RY[i] * PUSH * push + SHIMMER_POS * Math.sin(t * SF[q + 3] + SP[q + 3])) * h;
      const Z = (BZ[i] + RZ[i] * PUSH * push + SHIMMER_POS * Math.sin(t * SF[q + 4] + SP[q + 4])) * h;
      const x1 = X * cY + Z * sY, z1 = -X * sY + Z * cY;           // yaw about y
      const y2 = Y * cP - z1 * sP, z2 = Y * sP + z1 * cP;          // pitch about x: top tips towards you
      const P = f / (f - z2);
      const sx = x1 * P - (c - 11.5) * pitch, sy = -y2 * P - (r - 11.5) * pitch;
      const d = clamp((z2 / h + 1) / 2, 0, 1);

      let g, lit, vis;
      if (FACE[i] === FRONT) {
        const dly = 0.2 * Math.hypot(c - 11.5, r - 11.5) / 7.78;   // 7.78: centre to corner of the 12x12 block
        g = ease(clamp((u - 0.35 - dly) / 0.45, 0, 1));
        lit = smoothstep(0.7, 1, g);
        vis = 1;
      } else {
        g = ease(clamp((u - 0.4) / 0.5, 0, 1));
        lit = smoothstep(0.8, 1, u);
        vis = 1 - smoothstep(0.1, 0.5, u);
      }

      // Depth look: near dots larger and brighter (the grid's bloom glows
      // brighter around brighter dots on its own).
      const w = Math.pow(d, 1.3);
      const cubeOp = (lerp(0.12, 1, w) * (1 + SHIMMER_LIGHT * n0) * (1 + 0.4 * glow) + SPARK_GAIN * spark) * vis;
      const scale = lerp(0.3, 0.62, d) * P * (1 + 0.1 * glow + 0.3 * spark);

      // Colour and shadow: the cube look (with a stepped spark tint) until
      // the dot is half landed, then paint()'s look for its cell. Opacity
      // carries the blend either side of that one switch.
      const el = cells[i], st = el.style;
      let op;
      if (lit < 0.5) {
        const lvl = Math.round(spark * SPARK_LEVELS);
        const key = 'C' + lvl;
        if (lookKey[i] !== key) { st.backgroundColor = sparkBg[lvl]; st.boxShadow = 'none'; lookKey[i] = key; }
        op = lerp(cubeOp, landedLook(clamp(buf[i] * bright, 0, 1)).op, lit);
      } else {
        const tg = landedLook(clamp(buf[i] * bright, 0, 1));
        if (lookKey[i] !== tg.key) { st.backgroundColor = tg.bg; st.boxShadow = tg.shadow; lookKey[i] = tg.key; }
        op = lerp(cubeOp, tg.op, lit);
      }

      st.transform = 'translate(' + lerp(sx, 0, g).toFixed(2) + 'px,' + lerp(sy, 0, g).toFixed(2) + 'px) scale(' + lerp(scale, 1, g).toFixed(3) + ')';
      st.opacity = clamp(op, 0, 1).toFixed(3);
      // Depth order in 7 buckets, rewritten only when a dot changes bucket.
      const z = Math.round(d * (1 - g) * 6);
      if (zNow[i] !== z) { st.zIndex = 1 + z; zNow[i] = z; }
    }
  }

  // Hand the cells back: makeGrid's own inline values, no transform, no
  // layer promotion, and a forced full repaint so paint() owns every cell
  // from the next call.
  function handoff() {
    for (const el of cells) {
      const st = el.style;
      st.transform = '';
      st.zIndex = '';
      st.borderRadius = orig.radius;
      st.transition = orig.transition;
    }
    grid.el.style.filter = '';
    bloomNow = '';
    grid.prev.fill(-1);
    landed = true;
    silX = silY = 0;
  }

  function skip() {
    if (!landed) handoff();
    if (!finished) { finished = true; canvas.remove(); }
  }

  function frame(ts, restBright) {
    if (t0 === null) t0 = ts;               // the clock starts on the first painted frame
    const t = Math.max(0, (ts - t0) / 1000);
    const amp = beatAmp(t);
    const tau = sinceLub(t);
    const pulse = amp * lubDub(lightEnv, tau);
    const bright = restBright * (1 + 0.16 * pulse);
    const p = clamp(t / AP, 0, 1);
    if (!landed) {
      if (t >= SETTLE) handoff();
      else {
        cube(t, bright, tau, amp);
        // The shared bloom fades out over the end of the Turn, as each
        // landed dot takes on paint()'s own glow.
        const b = bloom(BLOOM_ALPHA * (1 - smoothstep(TURN + 0.6 * D, SETTLE, t)));
        if (b !== bloomNow) { grid.el.style.filter = b; bloomNow = b; }
      }
    }
    shutter(p, bright);
    if (t >= END && !finished) { finished = true; canvas.remove(); }
    // The glide: from screen centre to the grid's own place, eased in and
    // out, starting on the lub at H. The heart and the rocking run through it.
    const away = 1 - ease(clamp((t - H) / MOVE_SECONDS, 0, 1));
    return {
      landed, finished, pulse,
      glowMul: lerp(0.12, 1, smoothstep(0, 0.9, p)),
      reveal: smoothstep(TURN, TURN + 0.8, t),
      offX: startX * away, offY: startY * away,
      cx: silX, cy: silY,
    };
  }

  return { resize, frame, skip };
}
