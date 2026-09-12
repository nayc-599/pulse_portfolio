# Pulse — Brand Kit

Reference for building new pages and surfaces that must match the Pulse site.

---

## 1. Colour

### Core tokens

| Token | Hex | Use |
|---|---|---|
| `--bone` | `#F4F1EA` | Default page background. The device shell colour. |
| `--bone-2` | `#E8E3D8` | Alternating band background, form panels, figure plates, inline `code` fill. |
| `--charcoal` | `#1C1A17` | Dark sections, footer, code blocks, figures, primary ink on bone, dark buttons. |
| `--amber` | `#F5C86B` | The device's LED. Lit pixels, primary CTA fill, progress bar, focus ring. |
| `--amber-dim` | `#8A7043` | Unlit-pixel base, arrows and separators inside charcoal figures. |
| `--amber-deep` | `#6B5528` | Eyebrow text on bone, quote border, active nav rule. |
| `--signal` | `#A03A1E` | Errors, invalid inputs, "not built" warnings, false-alarm figures. |

### Text on bone

| Colour | Hex | Use | Contrast on `#F4F1EA` |
|---|---|---|---|
| Primary | `#1C1A17` | Headings, lead paragraphs, table keys | 15.2:1 |
| Body | `#4A453D` | Body copy, list items, captions in prose | 8.3:1 |
| Muted | `#5C574D` | Mono metadata labels, figcaptions, table headers | 6.4:1 |
| Eyebrow | `#6B5528` | Section eyebrows, numbered labels | 6.3:1 |
| Signal | `#A03A1E` | Validation messages | 6.1:1 |

### Text on charcoal

Alpha values are over `#1C1A17`.

| Colour | Use | Contrast on `#1C1A17` |
|---|---|---|
| `#F4F1EA` | Headings, primary copy | 15.2:1 |
| `rgba(244,241,234,0.86)` | Lead paragraph / hero subcopy | 11.5:1 |
| `rgba(244,241,234,0.62)` | Secondary body, code comments area | 6.4:1 |
| `rgba(244,241,234,0.55)` | Mono metadata, figcaptions, legal line | 5.3:1 |
| `#F5C86B` | Figure step numbers, threshold readout | 10.9:1 |
| `#A996FE` | Eyebrows and attribution copy on charcoal | 6.9:1 |

### MDN purple ramp

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--purple-700` | `#5433DB` | Link hover on bone | 6.5:1 on bone |
| `--purple-500` | `#6845F0` | Links, MDN mark on bone, current-week marker | 5.1:1 on bone |
| `--purple-400` | `#7854FC` | MDN lockup tint + attribution border/glow on charcoal | 3.7:1 — non-text only |
| `--purple-300` | `#A996FE` | Eyebrows and attribution text on charcoal | 6.9:1 on charcoal |

### Colour rules

**Amber** means *the device is doing something*. It is the LED: lit pixels, the primary CTA, the reading-progress bar, the focus ring. Never as body text on bone (1.4:1) and never as a page or section background.

**MDN purple** is identity only — links, the MDN mark, the footer attribution block, the single current-week marker. Never for device state, alerts, or as a section background.

**Signal** `#A03A1E` is reserved for error, invalid, and not-built. Never decorative; never on charcoal (use `#F4F1EA` there and carry the meaning in the copy).

Maximum two background colours per surface: `--bone` plus one of `--bone-2` or `--charcoal`.

---

## 2. Typography

| Family | Role | Source |
|---|---|---|
| General Sans (400, 500, 600) | Headings, body | `https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap` |
| Space Mono (400, 700) | Metadata, eyebrows, labels, code, figcaptions | `https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap` |

Stacks: `'General Sans', system-ui, sans-serif` · `'Space Mono', monospace`

### Scale

| Element | Size | Weight | Letter-spacing | Family |
|---|---|---|---|---|
| Page h1 (hero) | `clamp(40px,6vw,60px)/1.06` | 500 | `-0.03em` | Sans |
| Page h1 (section hero) | `clamp(38px,5.4vw,58px)/1.07` | 500 | `-0.03em` | Sans |
| Article h1 | `clamp(32px,5vw,48px)/1.1` | 500 | `-0.03em` | Sans |
| h2 | `clamp(28px,3.6vw,38px)/1.15` | 500 | `-0.02em` | Sans |
| Article h2 | `clamp(24px,3vw,30px)/1.2` | 500 | `-0.02em` | Sans |
| h3 | `22px/1.3` | 500 | `-0.015em` | Sans |
| Card title | `21–23px/1.25` | 500 | `-0.015em` | Sans |
| Lead paragraph | `19px/1.65–1.7` | 400 | — | Sans |
| Body | `17px/1.7` | 400 | — | Sans |
| Body small | `15–16px/1.7` | 400 | — | Sans |
| Stat numeral | `30px/1` | 500 | — | Sans |
| Eyebrow | `11px/1` | 400 | `0.2em` | Mono, uppercase |
| Metadata label | `10px/1–1.6` | 400 | `0.14em` | Mono, uppercase |
| Nav item | `13px/1` | 400 | `0.1em` | Mono, uppercase |
| Button | `12–13px/1` | 400 | `0.1–0.14em` | Mono, uppercase |
| Filter label | `14px/1.2` | 400 | — | Sans, sentence case |
| Table cell | `16px/1.5` | 400 | — | Sans |
| Table cell (value) | `13px/1.6` | 400 | `0.06em` | Mono |
| Code block | `13px/1.75` | 400 | — | Mono |
| Inline code | `15px/1.4` | 400 | — | Mono, `#E8E3D8` fill, `2px 6px` pad |
| Scroll cue | `10px/1` | 400 | `0.24em` | Mono, uppercase |

### Body copy rules

- Line-height `1.7` for body, `1.65` for lead, `1.15–1.3` for headings.
- Measure: `68ch` article body · `52ch` hero and lead · `60ch` closing notes · `26ch` headline max · `30ch` footer blurb.
- `text-wrap: pretty` on all `p`.
- Headings never above weight 500. Bold inside body copy is weight 500 with `color:#1C1A17`, not 700.
- Mono is never used for running prose — labels, data and code only.

---

## 3. Spacing and layout

| Measure | Value |
|---|---|
| Content max-width | `1160px` |
| Article max-width | `760px` |
| Page gutter | `24px` |
| Dark hero padding | `76–96px 24px 40–72px` |
| Light section padding | `88px 24px` |
| Main padding | `56–72px 24px 96px` |
| Stack gap between major sections | `80px` (article), `56–64px` (page) |
| Grid column gap | `40px` · row gap `36–44px` |
| Card grid gap | `28px` |
| Figure padding | `26–28px 22–24px 20–22px` |
| Header padding | `12px 24px` |
| Sticky offset | `top:88–96px` |

### Breakpoints

No media queries. Everything reflows on intrinsic rules:

| Pattern | Rule |
|---|---|
| Card grids | `repeat(auto-fill,minmax(min(100%,280px),1fr))` |
| Content blocks | `repeat(auto-fit,minmax(min(100%,200–260px),1fr))` |
| Two-column sections | `display:flex; flex-wrap:wrap` with `flex:1 1 320–380px` |
| Article + sidebar | sidebar `flex:0 1 200px`, body `flex:1 1 560px` |
| Every flex/grid child | `min-width:0` |
| Wide tables | wrapper `overflow-x:auto`, table `min-width:460–520px` |

Sibling groups always use `display:flex`/`grid` + `gap`, never margins or inline whitespace.

---

## 4. Components

### LED pixel grid

Square cells on a fixed grid. Lit = `#F5C86B` at opacity 1; unlit = `rgba(138,112,67,0.22)` (or `#F5C86B` at opacity `0.06` on charcoal plates). Cell `border-radius:1px`.

| Property | Value |
|---|---|
| Glow (lit, component) | `0 0 max(2px, cell×0.8) rgba(245,200,107,0.34)` |
| Glow (lit, hero) | `0 0 6px rgba(245,200,107,0.32)` |
| Transition | `background 900ms`, `box-shadow 900ms` |
| Mouth arc | `y = round(0.64n + 0.065n · sin(πt))`, span `0.24n → n−1−0.24n` |
| Eyes | 3×3 blocks at `x = 0.22n` and `0.62n`, `y = 0.26n` |

| Size | Cell / gap / pad | Use |
|---|---|---|
| 24 × 24 | 11 / 2 / — | Hero face (height-clamped to 6–11px) |
| 14 × 14 | 14 / 3 / 22px | Large device portrait |
| 14 × 14 | 9 / 3 / 18px | Featured journal entry |
| 11 × 11 | 12 / 3 / 20px | 404 face |
| 11 × 11 | 7 / 2 / 0 | Cube display |
| 11 × 11 | 6 / 2 / 12px | Form success state |
| 11 × 11 | 5 / 1 / 7px | Scale-figure device |
| 7 × 7 | 6 / 2 / 9px | List motifs, team avatars |
| 7 × 7 | 4 / 1 / 6px | Byline avatar |
| 7 × 7 | 3 / 1 / 5px | Footer wordmark |
| 5 × 5 | 3 / 1 / 4px | Header wordmark |

Patterns: `face`, `neutral`, `asleep`, `lattice`, `scatter`, `ring`, `staircase`, `iris`. Non-face patterns are decorative motifs and take `aria-hidden`.

**Charcoal plate rule:** every pixel grid sits on a `#1C1A17` plate with `border-radius:2px`. A grid never sits directly on bone — the unlit cells need the dark ground to read as a display. On charcoal sections the plate is the background itself.

### Section eyebrows

```
[sparkle 11×11] [12px gap] EYEBROW TEXT
```
`display:flex; align-items:center; gap:9px`, margin-bottom `16–20px`.

| Background | Glyph | Text |
|---|---|---|
| Bone / bone-2 | `assets/sparkle-purple.png` | `#6B5528` |
| Charcoal | `assets/sparkle-p300.png` | `#A996FE` |

Numbered form: `01 · THE PROBLEM`. Glyph is `aria-hidden` with empty alt.

### Hairlines and dividers

| Context | Value |
|---|---|
| On bone — block divider | `1px solid rgba(28,26,23,0.16)` |
| On bone — list rows | `1px solid rgba(28,26,23,0.18)` |
| On bone — table head, baselines | `1px solid rgba(28,26,23,0.3)` |
| On bone — table rows | `1px solid rgba(28,26,23,0.14)` |
| On charcoal | `1px solid rgba(244,241,234,0.14–0.18)` |
| Header underline | `1px solid rgba(28,26,23,0.12)` |
| Blockquote | `2px solid #6B5528`, `padding-left:24px` |
| Not-built pill | `1px dashed #A03A1E`, `border-radius:999px`, `9px 16px` |

Lists rule top-and-bottom: `border-top` on every `li` plus a closing empty `div` with `border-top`.

### Buttons and links

| Variant | Spec | Hover |
|---|---|---|
| Primary (dark bg) | `#F5C86B` fill, `#1C1A17` text, `15px 22px`, mono 13px/`0.1em` upper | `translateY(-3px)` |
| Primary action (light bg) | no box. Sans 15px `#1C1A17`, `1px solid rgba(28,26,23,0.3)` bottom rule, `padding-bottom:5px`, `→` at `gap:10px` | `#6845F0` text + rule, arrow `translateX(4px)` |
| Form submit (light bg) | transparent, `1px solid rgba(28,26,23,0.3)`, `#1C1A17`, `15px 22px` | `#6845F0` text + border |
| Secondary (dark bg) | transparent, `1px solid rgba(244,241,234,0.4)`, `#F4F1EA` | border `#F5C86B`, `translateY(-3px)` |
| Filter, unselected | no box. 8px LED marker `rgba(138,112,67,0.55)` + Sans 14px `rgba(244,241,234,0.6)`, `gap:10px`, row `gap:28px` | text `#F4F1EA` |
| Filter, selected | 8px marker `#F5C86B` with `0 0 7px rgba(245,200,107,0.5)` + Sans 14px `#F4F1EA` | — |
| Nav item | mono 13px/`0.1em`, `#4A453D`, `9px 12px`, `border-bottom:2px solid transparent` | `#1C1A17`, border `rgba(28,26,23,0.35)` |
| Nav active | `#1C1A17`, `border-bottom:2px solid #6B5528` | — |
| Inline link | `#6845F0` | `#5433DB` |
| Standalone link | `#1C1A17`, `1px solid rgba(28,26,23,0.3)` underline | `#6845F0` both |
| Text link (light on dark) | `#F4F1EA` | `#F5C86B` |
| Ghost link | mono 12px/`0.14em` upper, `#4A453D`, `1px` bottom rule, `padding-bottom:4px` | `#1C1A17` both |

All button transitions `900ms cubic-bezier(0.37,0,0.63,1)`. Buttons are square — no radius except the dashed pill. Small controls (filters, pagination, lightbox controls) carry no border or fill: state is an 8px LED marker, ink weight, or a bottom hairline.

### Metadata labels and tags

Mono, uppercase, `0.14em`, `10px`. Separator is ` · `. Standard forms:

- `ENGINEERING · 28 AUG 2026 · 11 MIN READ`
- `WEEK 8 · INTEGRATION`
- `FIGURE 1 · INFERENCE PIPELINE`
- `01 · THE PROBLEM`

Colour: `#5C574D` on bone, `#6B5528` when it carries the eyebrow role, `rgba(244,241,234,0.55)` on charcoal.

### MDN header lockup

```
[MDN mark 26px] [1px × 28px rule rgba(28,26,23,0.18)] [5×5 pixel grid] [Pulse / A DEEPNEURON PROJECT]
```
`gap:14px`. "Pulse" is Sans 19px/500 `-0.02em`; the sub-line is Mono 10px `0.14em` `#5C574D`. Header is `position:sticky; top:0; z-index:50`, `rgba(244,241,234,0.94)` + `backdrop-filter:blur(8px)`.

### Footer attribution block

Linked card, last cell of the footer grid: `padding:22px`, `1px solid #7854FC`, `border-radius:3px`, transparent fill,
`box-shadow: 0 0 28px rgba(120,84,252,0.28), inset 0 0 22px rgba(120,84,252,0.16)`
→ hover `0 0 40px rgba(120,84,252,0.42), inset 0 0 30px rgba(120,84,252,0.24)` over `900ms`.
Contains `assets/mdn-lockup-purple.png` (`max-width:190px`) above one Mono 12px/1.7 `0.08em` `#A996FE` line.

Footer shell: `#1C1A17`, `padding:72px 24px 40px`, grid `repeat(auto-fit,minmax(220px,1fr))`, `gap:48px`; legal strip `margin-top:56px`, `border-top:1px solid rgba(244,241,234,0.14)`.

---

## 5. Motion

Single easing curve: `cubic-bezier(0.37,0,0.63,1)`.

| Duration | Use |
|---|---|
| `260ms` | Lightbox fade-in |
| `400ms` | Nav colour and rule |
| `900ms` | Hover lifts, borders, pixel transitions |
| `2400ms` | Hero copy fade-in |
| `10s` | Breath cycle (glow, brightness, scroll cue) |

Hero face constants: wake on first pointer/scroll/key, auto-wake `4500ms`; blink every `4000–8000ms` random, lid eased at `0.16`/frame, closed `130ms`; idle after `30000ms` of no input (brightness `0.34`, eyes closed); asleep `0.30`, awake `0.86–1.00` on the breath. Eye lerp `0.055`/frame, travel ±2 cells x, ±1.5 cells y — do not raise the range or lower the lag.

Device cube: `rotateX(-14deg) rotateY(-60deg → +50deg)` linked to viewport progress.

**Allowed:** hover lifts and colour transitions; the hero face (breath, blink, tracking, wake/idle); pixel-grid glances on hover; the reading-progress bar; the cube's scroll rotation; lightbox fade.

**Not allowed:** scroll-driven narrative or reveal sequences, parallax, entrance animations on content, autoplay, looping background motion, animated gradients, spinners, marquees, count-ups. Total interactive count on the site is four: hero face, pipeline accordion, threshold slider, media lightbox.

---

## 6. Assets

| File | Use |
|---|---|
| `assets/mdn-mark-white.png` | MDN mark on charcoal, when purple is too low-contrast |
| `assets/mdn-mark-purple.png` | MDN mark on bone — header, team intro |
| `assets/mdn-lockup-purple.png` | Full MDN + AI lockup, footer attribution card only |
| `assets/sparkle-purple.png` | Eyebrow glyph on bone / bone-2 |
| `assets/sparkle-p300.png` | Eyebrow glyph on charcoal |

Wireframe graphics — decorative only, `aria-hidden`, `pointer-events:none`, `position:absolute`, bleeding off one edge at `opacity 0.06–0.10`, never behind body text:

| File | Tint | Use |
|---|---|---|
| `assets/wf-sphere-white.png` | bone | Charcoal heroes |
| `assets/wf-net2-white.png` | bone | Footer |
| `assets/wf-torus-white.png` | bone | Charcoal sections |
| `assets/wf-net1-purple.png` | `#7854FC` | Charcoal heroes (Project, Journal) |
| `assets/wf-orb-purple.png` | `#7854FC` | Charcoal heroes (Media) |
| `assets/wf-melt-purple.png` | `#7854FC` | 404 |
| `assets/wf-sphere-purple.png` | `#7854FC` | Spare |
| `assets/wf-torus-purple.png` | `#7854FC` | Bone sections |
| `assets/wf-net3-purple.png` | `#7854FC` | Spare |

Image placeholders use `repeating-linear-gradient(135deg,#E8E3D8 0 8px,#DFD9CC 8px 16px)` on bone, `repeating-linear-gradient(135deg,#232120 0 10px,#2B2825 10px 20px)` on charcoal, with a Mono 10px `0.14em` `#5C574D` label naming what goes there.

---

## 7. Accessibility

**Focus ring:** `:focus-visible { outline: 2px solid #F5C86B; outline-offset: 3px; }` — global, never removed, on both backgrounds.

**Contrast minimums:** 4.5:1 for text, 3:1 for headline-scale type and non-text boundaries. Full-opacity ink only — no `color-mix` or alpha-muted type below the values tabulated in §1. `#F5C86B` and `#7854FC` are never text on bone.

**Reduced motion** (`prefers-reduced-motion: reduce`): hero face renders static — eyes open, full brightness, no tracking, no blink, no glow animation — and the copy is present immediately; the cube holds its initial rotation with no scroll listener; pixel grids do not blink or glance. Hover colour changes and the focus ring are retained.

**Structure:** one `h1` per page, no skipped heading levels. Every `section` carries `aria-labelledby` or `aria-label`. Accordions are `<button aria-expanded>`; the lightbox is `role="dialog" aria-modal="true"` with Escape and arrow-key handling. Decorative images take `alt=""` + `aria-hidden`. Form fields have real `<label for>`, `aria-invalid` on error, and error text in `#A03A1E` at 11px Mono. Visually hidden text uses `clip:rect(0 0 0 0)` with `1px` box, never `display:none`.
