"""Build the Project page's Figure 1 tiles and Figure 2 screenshot.

    python3 tools/make_figure_assets.py

Writes:
    uploads/originals/figure1-real-tiles/fig1-<stage>@2x / @3x .webp/.jpg
        96px tiles at 192px and 288px, banner grade. NOT published: Figure 1
        currently uses the dot-matrix icons; these are kept for later reuse.
    uploads/originals/figure2-alert-crop/fig2-alert.webp / .jpg
        the alert card, Tonight and Recent alerts at native size. Also NOT
        published: Figure 2 is the original threshold demo again.
    fig2-alert.webp / .jpg              the dashboard's alert card, Tonight timeline
                                        and Recent alerts, at native size (never enlarged)

Sources (non-UNBC only, all already privacy-checked):
    uploads/originals/dashboard_1.png        the live dashboard, Nay Chi on camera;
                                             the bystander behind the glass is blurred here
    media/video/frame-extract-demo.mp4       Christopher, frame 314 (10.49 s), status bar
                                             already blurred in this file; tile 03 is the
                                             repo's own align_face output for that frame,
                                             saved by the step documented below
    uploads/originals/Person_Detection_Demo.mp4   Aaron at 3.0 s

Tile 03 needs pulse-ai's aligner (MediaPipe), so it is produced separately:
    cd ../pulse-ai && .venv/bin/python - <<'EOF'
    # detect on the webcam window enlarged 2x, then align_face -> 224x224 RGB
    EOF
and saved as uploads/originals/fig1-cnn-aligned-314.png, which this script reads.
When a single consistent clip exists, pulse-ai/scripts/make_pipeline_figures.py
can regenerate all six from it instead.
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
TILES_OUT = ROOT / "uploads" / "originals" / "figure1-real-tiles"   # not published
FIG2_OUT = ROOT / "uploads" / "originals" / "figure2-alert-crop"    # not published (Figure 2 is the threshold demo again)
TILE = 96


def grade(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = np.clip((lum + (a - lum) * 0.88) * np.array([0.96, 0.99, 1.04]), 0, 1) ** 1.10
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))


def dashboard() -> Image.Image:
    im = Image.open(ROOT / "uploads/originals/dashboard_1.png").convert("RGB")
    tx, ty = 999, 121
    box = (tx + 765, ty + 330, tx + 812, ty + 420)      # bystander behind the glass
    region = im.crop(box)
    w, h = region.size
    region = region.resize((max(1, w // 10), max(1, h // 10)), Image.BILINEAR).resize((w, h), Image.NEAREST)
    region = region.filter(ImageFilter.GaussianBlur(6))
    mask = Image.new("L", (w, h), 0)
    mask.paste(255, (4, 4, w - 4, h - 4))
    im.paste(region, box[:2], mask.filter(ImageFilter.GaussianBlur(3)))
    return im


def video_frame(path: str, seconds: float) -> Image.Image:
    cap = cv2.VideoCapture(str(ROOT / path))
    cap.set(cv2.CAP_PROP_POS_MSEC, seconds * 1000)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise SystemExit(f"Could not read {path} at {seconds}s")
    return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))


def save(im: Image.Image, base: Path, quality: int = 86) -> None:
    im = im.convert("RGB")
    im.info = {}
    im.save(base.with_suffix(".jpg"), quality=quality, optimize=True, progressive=True)
    im.save(base.with_suffix(".webp"), quality=quality - 4, method=6)


def main() -> None:
    TILES_OUT.mkdir(parents=True, exist_ok=True)
    FIG2_OUT.mkdir(parents=True, exist_ok=True)
    d = dashboard()
    tiles = {
        "01-camera": d.crop((1240, 140, 1800, 700)),        # Bed 01 camera view, clear of the tile's labels
        "02-face": d.crop((1374, 230, 1634, 490)),          # the face box
        "03-cnn": Image.open(ROOT / "uploads/originals/fig1-cnn-aligned-314.png").convert("RGB"),
        "04-lstm": d.crop((1608, 700, 1778, 870)),          # Bed 01 PAIN · PSPI readout
        "05-alert": d.crop((2030, 145, 2290, 405)),         # the CHECK alert card (tight crop, stops above "Tonight")
        "06-pose": video_frame("uploads/originals/Person_Detection_Demo.mp4", 3.0).crop((971, 245, 1871, 1145)),
    }
    for key, im in tiles.items():
        g = grade(im)
        for scale in (2, 3):
            save(g.resize((TILE * scale, TILE * scale), Image.LANCZOS), TILES_OUT / f"fig1-{key}@{scale}x")
        print(f"fig1-{key}: source {im.size}")
    fig2 = d.crop((2020, 140, 2715, 1110))                  # card, Tonight, Recent alerts
    save(fig2, FIG2_OUT / "fig2-alert", quality=90)
    print(f"fig2-alert: {fig2.size} (native)")


if __name__ == "__main__":
    main()
