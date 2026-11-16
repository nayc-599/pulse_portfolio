# Pulse brand kit

The device direction. The site is dark-first and looks like the cube's own pixel screen. This file is the source of truth for `css/tokens.css` and `css/device.css`; if the two disagree, fix the code or update this file in the same change.

---

## 1. Personality

**A calm night-light with a face.**

Pulse sits on a bedside table in a dark room and watches so a carer doesn't have to. It should feel like something you'd be fine leaving on all night: warm, quiet, a little alive. It is not a medical console, a security camera or a tech demo.

- Calm before clever. Nothing flashes, nothing competes for attention.
- One warm light in a dark room. Amber is the only colour that glows.
- Honest about what it is. A student research prototype, said plainly and often.
- Alive, not busy. The face blinks and glances. Nothing else moves for the sake of moving.

---

## 2. Colour

The site has two modes with identical layouts; only colours change.

- **Light** is the original cream scheme (`css/tokens.css`): cream background `#F4F1EA`, headings and primary text in warm charcoal `#2B2925` (12.9:1, not black), body `#4A453D` (8.4:1), muted `#5C574D` (6.4:1), the original amber. The home hero stays a dark band so the face sits on charcoal, as on the original site.
- **Dark** is the device palette below (`css/device.css`, on `html.theme-device`).
- **Choosing:** the system setting by default; a choice made with the switch overrides it and is saved in localStorage. A small script in `<head>` applies it before CSS paints, so there is no flash of the wrong mode.
- **The switch:** an iOS-style toggle in the nav, right of the links: a 46 × 28px pill with a 24px white knob that slides in 200ms (no animation with reduced motion). Grey track `#8f897d` (3.1:1 against the cream header) with the knob left = light; honey track with the knob right = dark. A muted "Dark" label beside it. It is a real `<button role="switch" aria-checked>` labelled "Dark mode", with a 44px tap area and a visible focus ring.
- Banners, photos and dashboard screenshots look the same in both modes.
- Charts and documents with a white background (in posts and on Media) sit in a 1px line-colour frame with 12px padding on the raised surface colour, in both modes, so they don't glare in dark mode. On Media, mark them with `"frame": true` in `_data/media.json`; in posts, use `<figure class="figure--framed">`.

### Dark palette

| Name | Hex | Role | Contrast |
|---|---|---|---|
| Background | `#1b1a17` | Page background, footer, and the end of every banner fade. Warm charcoal, not black. | |
| Surface | `#24221e` | Raised: figure panels, cards, strips, LED plates | |
| Line | `#302d28` | Quiet lines: header and footer rules | |
| Line 2 | `#423d35` | Frames, list rules, the Figure 1 connector | |
| Heading | `#e6e0d4` | Headings, a step brighter than body so they lead | 13.2:1 on background, 12.1:1 on surface |
| Body text | `#d9d2c5` | Body text and links (underlined) | 11.6:1 on background, 10.6:1 on surface |
| Muted | `#9a9387` | Labels, captions, status lines, role lines, figure step numbers | 5.7:1 on background, 5.2:1 on surface |
| Honey (accent) | `#e9bb63` | Only: the pixel face and figure icons, the small square markers, links on hover, focus rings, the active nav underline, the switch track when on. | 9.7:1 on background |
| Dim pixel | `#998256` | Unlit pixels (at 12% opacity), so the grid stays faint but visible | |
| Status red | `#e07a5f` | "Not built yet" flags and false alarms in the threshold demo | 5.9:1 on background |
| Alarm colours | dashboard palette | Only where the dashboard itself is shown (screenshots). Never in site chrome. | |

Rules:

- The accent (honey `#e9bb63` in dark mode, the original amber in light mode) is rare. It marks the device (the face, figure icons, the square markers) and interaction (hover, focus, the active page). Paragraphs, labels, status lines, step numbers and role lines are never in the accent; they are Text or Muted.
- Links are body text with an underline and turn the accent colour on hover.
- There is no purple anywhere on the site. Links to Monash DeepNeuron look like every other link.
- The Monash DeepNeuron mark is used as supplied, never recoloured: the official white mark in dark mode and in the footer. Light mode still uses the purple file until an official dark (charcoal) mark is supplied.
- Text is Text or Muted. No alpha-muted text below the ratios above.
- Lines and connectors in figures use Line 2, not the accent.
- Banners fade to the background colour: page heroes behind their text, and the home closing banner fully over its bottom 35%, so it runs into the footer with no edge, border or gap. Text on the fade measures at least 5.1:1 (heading, large text) and 7.0:1 (links) at 375, 768 and 1440px.
- The footer is the background colour, and the footer's pixel face sits straight on it with no plate.

---

## 3. Type

| Font | Role |
|---|---|
| Pixelify Sans 600 | The "Pulse" wordmark only. Never headings, never body. |
| General Sans 400 / 500 | Headings, body, labels, buttons, navigation. Headings at 500, never heavier. |
| Space Mono 400 | Real data only: figure numbers, week labels, timestamps, live dashboard values, code. |

- Mono is data, not decoration. Section labels, eyebrows, status words and subheadings are General Sans in sentence case.
- Figure captions are one line of General Sans, muted, sentence case: `Figure 1 · Two branches · both run live, end to end`. No spaced mono for the figure number.
- Use ` · ` between parts of a label or metadata line (`Build log · 7 Oct 2026 · 5 min read`). Use normal punctuation in sentences.
- Eyebrows are short page or section names only ("The project", "Build log", "Team", "Media"), never an organisation name. Same style everywhere: 8px marker, 14px General Sans 500, sentence case, heading colour, 9px gap, 18px above the heading.
- Dates: "7 October 2026" in prose and headings; "7 Oct 2026" in compact meta lines, cards and labels (three-letter months, so "Sep").
- Weeks: "Week 8" in text and labels; "WK 8" only on Media tiles.
- Units: a space before the unit, lower case: "8 cm", "30 fps", "400 ms".
- Quotes: curly ’ “ ” in visible text. The build converts them (`eleventy.config.js`, smartQuotes), leaving code, scripts and attributes alone.
- Names: "Monash DeepNeuron" in full in visible text (never "MDN" or "Deep Neuron"); "Pulse"; page names Home, Project, Journal, Media, Team everywhere.
- Long reading on dark: body at 18px or more, line-height about 1.6, about 70 characters per line.
- Headline scale: `clamp(36px, 4.6vw, 54px)` for the home hero, `-0.03em` tracking, `text-wrap: balance`.

---

## 4. The face

The face is the brand. It lives on a 24 × 24 grid of square pixels (11 × 11 and 5 × 5 for small uses), drawn by `face()` in `js/pixel-grid.js`. The examples below were rendered from that function at 11 × 11 (`#` lit, `+` half-lit, `.` unlit).

**Happy** (resting)
```
. . . . . . . . . . .
. . # # # . # # # . .
. . # # # . # # # . .
. . # # # . # # # . .
. . . # . . . . # . .
. . . + # # # # + . .
. . . . . + + . . . .
```

**Blink** (every 3.5 to 8 s)
```
. . . . . . . . . . .
. . . . . . . . . . .
. . # # # . # # # . .
. . . . . . . . . . .
. . . # . . . . # . .
. . . + # # # # + . .
. . . . . + + . . . .
```

**Glance** (eyes move up to 2 cells; occasional, under a second)
```
. . . . . . . . . . .
. # # # . # # # . . .
. # # # . # # # . . .
. # # # . # # # . . .
. . . # . . . . # . .
. . . + # # # # + . .
. . . . . + + . . . .
```

**Sleepy** (eyes mostly closed and low, mouth flattening)
```
. . . . . . . . . . .
. . . . . . . . . . .
. . # # # . # # # . .
. . . . . . . . . . .
. . . + . . . . + . .
. . . # # # # # # . .
. . . . . + + . . . .
```

**Concerned** (eyes open, mouth flat)
```
. . . . . . . . . . .
. . # # # . # # # . .
. . # # # . # # # . .
. . # # # . # # # . .
. . . + + + + + + . .
. . . # # # # # # . .
. . . . . . . . . . .
```

**Heartbeat** (motion, not a still): a lub-dub at 96 bpm. On each beat the lit pixels brighten by up to 16%, the face scales by up to 2% and the glow by up to 60%; the dub lands just after the lub at 55% strength. Used only in the home hero intro.

Grid rules:

- Grids sit on a Surface plate (`#24221e`, 2px radius), except the footer's small face, which sits straight on the background.
- Lit pixels are the accent with a soft glow in the same colour; unlit pixels are the dim pixel colour at 12%.
- Pixels are square with a 1px radius. No circles, no gradients inside a pixel.

---

## 5. Shape

- **The pixel marker:** a single 8px square pixel in the accent colour (1px radius) in front of eyebrows and the hero kicker. It replaces the old sparkle everywhere.
- **No buttons for links.** Anything that takes you somewhere is a plain text link: Text-colour text, 1px underline about 4px below, no background, border or padding box. On hover the text and underline turn amber. Only real form buttons (the contact form's submit) keep a box: a square 1px outline that turns amber on hover.
- **Square corners.** Frames and cards have no radius. Pixels keep their 1px radius.
- **Layout is unchanged from the cream site.** The device direction is a colour and type change; every page keeps its original sections and order. The one layout change is the home hero: face on the left, text on the right (stacked under 768px).

---

## 6. Photography

- Real photos and real footage only, never illustrations or stock. Our own hardware, our own dashboard, us.
- **Grade: neutral-warm.** Slightly desaturated (about 94%), a touch warm (red up about 3%, blue down about 7%), no crush. It replaces the earlier cool, dark grade so photos sit with the amber instead of fighting it.
- Banners keep a the background gradient at the text edge so Text-colour text stays at AA or better.
- Privacy before everything: no UNBC-McMaster frames, faces or data; nobody outside the team without their say; blur IDs, labels, addresses, other people's QR codes and screens; strip EXIF and XMP; originals stay in `uploads/originals/`, which is never published.

---

## 7. Motion

One easing curve: `cubic-bezier(0.37, 0, 0.63, 1)`.

**Home hero intro** (`js/hero-cube.js`, driven by `js/hero.js`): an eight-blade shutter opens at screen centre onto a dot cube, which glides from the centre to the face's place on the left, turns to face you and settles into the resting face; the hero text fades in as it arrives (2.4 s). About 4 s in all. The cube's heartbeat hold (a lub-dub at 96 bpm before the glide) is built but switched off with `ENABLE_HEARTBEAT = false`.

**Resting face:** eyes follow the pointer (up to 2 cells across, 1.5 down), a blink every 4 to 8 s, brightness and glow breathing on a 10 s cycle, eyes close after 30 s with no input. On later visits in a session the face starts asleep and wakes on the first input or after 4.5 s; the text is shown at once.

| Duration | Use |
|---|---|
| 260ms | Lightbox fade-in |
| 400ms | Nav colour and rule |
| 900ms | Hover colour and underline changes |
| 2400ms | Hero copy fade-in |
| 10 s | Breath cycle (glow, brightness, scroll cue) |

- The intro plays once per browser session; later visits start in the final state. Add `?intro=1` to the URL to replay it, ignoring the session and reduced motion (for checking and demos).
- Any scroll, click, key press or resize during the intro skips to the end.
- **Reduced motion:** the final state immediately: face awake and static, no tracking, blinks or glow animation.
- **Allowed:** the face, hover changes, the threshold slider, the media viewer, the cube's scroll rotation.
- **Not allowed:** parallax, scroll-driven reveals, autoplaying video with sound, looping background motion, animated gradients, spinners, count-ups.

---

## 8. Voice

Write the way a student would explain the project to a friend.

- First person plural: "we". Short, normal sentences. Specific facts and numbers.
- Say what it is plainly: a research prototype built by students, not a medical device, not tested with patients.
- No wordplay, aphorisms, setups and payoffs, "not X but Y" turns, rhetorical questions or lists of three for rhythm.
- Avoid: journey, unlock, seamless, empower, leverage, robust, cutting-edge, delve, game-changer, at its core, it's worth noting, under the hood.
- No em-dashes.
- Use ` · ` between parts of a label or metadata line. Use normal punctuation in sentences.

---

## 9. Accessibility

- Text at 4.5:1 or better everywhere; non-text boundaries at 3:1 where they carry meaning. The lowest text ratio on any page is 5.8:1 (Muted on Surface).
- Focus ring: 2px outline in the accent colour, 3px offset, with a gap in the background colour, so it shows on the background, the surface and photos.
- One `h1` per page, no skipped heading levels, every section labelled.
- No sideways scroll at 375px.

---

## 10. Don'ts

- Don't use purple. Don't recolour the Monash DeepNeuron mark.
- Don't add a second accent colour. Amber is the only one.
- Don't use alarm colours (red, orange, green status colours) outside the dashboard.
- Don't use Pixelify Sans for anything but the "Pulse" wordmark.
- Don't use uppercase letter-spaced mono for labels that aren't data.
- Don't put a pixel grid straight on the background (except the footer face); use the Surface plate.
- Don't style links as buttons. Only real form buttons get a box.
- Don't round frames or cards.
- Don't put white charts or screenshots straight on the background; frame them.
- Don't use illustrations, stock photos or AI-generated images.
- Don't animate on scroll, add parallax or add entrance animations outside the home hero.
- Don't change page layouts for the theme; it is colours and type only.
- Don't call Pulse a medical device, imply it has been tested with patients, or overstate what runs live.
- Don't write em-dashes.
