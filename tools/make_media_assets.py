"""Build the Media page's image files from their sources.

    python3 tools/make_media_assets.py

For every entry in ASSETS below it writes, into media/gallery/:
    <id>-800.webp / .jpg     thumbnail, about 800px wide
    <id>-full.webp / .jpg    full size, at most 2000px wide (never enlarged)
and for entries with a `mosaic` crop:
    mosaic-<id>.webp / .jpg  a tall slice for the Media banner, with the site's
                             banner grade (slightly desaturated, cooler, darker)
Video poster frames are taken from the processed files in media/video/
(the versions with any on-screen details already blurred).

Every output is a freshly encoded image, so no EXIF, XMP, ICC or comment data
is carried over. Sources must already be redacted: this script never reads
anything from a dataset folder and does no redaction of its own except where
noted (the ward view's bystander).

To add a photo: add an entry here, run the script, then add the item to
_data/media.json. Requires Pillow and NumPy (and OpenCV for video posters).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "media" / "gallery"
THUMB_W, FULL_MAX_W = 800, 2000

# id: source, optional crop box (x0, y0, x1, y1) for the gallery image, optional
# mosaic crop box (portrait) for the banner slice, optional video time for posters.
ASSETS = {
    "showcase-night": {"src": "uploads/originals/showcase.jpeg", "crop": (488, 300, 2048, 1340),
                       "mosaic": (700, 340, 1340, 1340)},
    "makerspace-box": {"src": "media/makerspace-box.jpg",
                       "mosaic": (360, 0, 980, 1090)},
    "cad-render": {"src": "uploads/originals/week6-cad-cube-render.png"},
    "dashboard-redesign": {"src": "media/week8-dashboard-redesign.png"},
    "ward-view": {"src": "uploads/originals/dashboard_1.png", "redact_bystander": True,
                  "mosaic": (1150, 121, 1800, 845)},
    "pose-demo-poster": {"video": "media/video/pose-demo.mp4", "t": 3.0,
                         "mosaic": (330, 0, 790, 720)},
    # Frame 314 (10.49 s): neutral, eyes open, mouth closed, the sharpest neutral
    # moment in the clip. Taken from the processed file, so the status bar is
    # already blurred; the mosaic crop also stops above it (y < 460).
    "frame-extract-demo-poster": {"video": "media/video/frame-extract-demo.mp4", "frame": 314,
                                  "mosaic": (370, 60, 670, 455)},
    "dashboard-demo-poster": {"video": "media/video/dashboard-demo.mp4", "t": 8.0},
    "poster": {"src": "uploads/originals/showcase-poster-1400.jpg"},   # rendered from media/pulse.pdf at 1400px tall
    # The open parts box. Source: makerspace.heic (GPS in its metadata), turned
    # upright into a PNG; the export below is a fresh file, so nothing carries
    # over. Crop drops the shelf sign (right) and the lower shelf; the barcode
    # on the cable box at the left edge is blurred.
    "makerspace-open": {"src": "uploads/originals/makerspace-open-upright.png",
                        "blur": [(240, 3550, 700, 4050)],
                        "crop": (163, 775, 3754, 4896)},
    "workflow": {"src": "media/workflow.png", "quality": 90},
    "contract": {"src": "media/contract.png", "quality": 90},
    "skeletal-code": {"src": "media/skeletal_code.png", "crop": (0, 44, 1162, 936), "quality": 90},  # top line was cut in half
    "pspi-info": {"src": "media/pspi_info.png", "quality": 90},
    "class-balance": {"src": "media/class_balance.png", "quality": 90},
    "training-curves": {"src": "media/training_curves.png", "quality": 90},
    # Dashboard screenshots (dark UI, simulated data, 1440 x 900, so never
    # enlarged). A teammate's first name appears as the carer who
    # acknowledged an alarm; it is blurred in the published copies.
    "ward-calm": {"src": "uploads/originals/ward-calm-dark.png", "quality": 90},
    "ward-alarm": {"src": "uploads/originals/ward-alarm-dark.png", "quality": 90,
                   "blur": [(1224, 783, 1270, 801)]},
    "bed-view": {"src": "uploads/originals/bed-view-dark.png", "quality": 90,
                 "blur": [(1224, 806, 1270, 824)]},
    "events": {"src": "uploads/originals/events-dark.png", "quality": 90,
               "blur": [(933, 638, 981, 656), (1224, 704, 1270, 722)]},
    "trends": {"src": "uploads/originals/trends-dark.png", "quality": 90,
               "blur": [(1224, 704, 1270, 722)]},
    "setup": {"src": "uploads/originals/setup-dark.png", "quality": 90},
}

# Build only these ids when given on the command line, e.g.
#   python3 tools/make_media_assets.py ward-calm ward-alarm
import sys as _sys
if len(_sys.argv) > 1:
    ASSETS = {k: v for k, v in ASSETS.items() if k in _sys.argv[1:]}


def grade(im: Image.Image) -> Image.Image:
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255
    lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])[..., None]
    a = np.clip((lum + (a - lum) * 0.88) * np.array([0.96, 0.99, 1.04]), 0, 1) ** 1.10
    return Image.fromarray((a * 255 + 0.5).astype(np.uint8))


def redact_ward_bystander(im: Image.Image) -> Image.Image:
    """dashboard_1.png: a bystander behind the glass inside the Bed 01 tile."""
    tx, ty = 999, 121
    box = (tx + 765, ty + 330, tx + 812, ty + 420)
    region = im.crop(box)
    w, h = region.size
    region = region.resize((max(1, w // 10), max(1, h // 10)), Image.BILINEAR).resize((w, h), Image.NEAREST)
    region = region.filter(ImageFilter.GaussianBlur(6))
    mask = Image.new("L", (w, h), 0)
    mask.paste(255, (4, 4, w - 4, h - 4))
    im.paste(region, box[:2], mask.filter(ImageFilter.GaussianBlur(3)))
    return im


def video_frame(path: str, t: float | None = None, index: int | None = None) -> Image.Image:
    """One frame, by exact index (preferred, reproducible) or by time in seconds."""
    import cv2
    cap = cv2.VideoCapture(str(ROOT / path))
    if index is not None:
        for _ in range(index):              # decode forward: seeking can land a frame off
            cap.grab()
    else:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, frame = cap.read()
    cap.release()
    if not ok:
        raise SystemExit(f"Could not read {path} at {index if index is not None else t}")
    return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))


def save(im: Image.Image, base: Path, quality: int = 82) -> None:
    im = im.convert("RGB")
    im.info = {}
    im.save(base.with_suffix(".jpg"), quality=quality, optimize=True, progressive=True)
    im.save(base.with_suffix(".webp"), quality=quality - 4, method=6)


def width(im: Image.Image, w: int) -> Image.Image:
    if im.width <= w:
        return im
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for key, spec in ASSETS.items():
        if "video" in spec:
            im = video_frame(spec["video"], spec.get("t"), spec.get("frame"))
        else:
            im = Image.open(ROOT / spec["src"]).convert("RGB")
        if spec.get("redact_bystander"):
            im = redact_ward_bystander(im)
        for box in spec.get("blur", []):          # heavy pixelate + blur, baked into the file
            region = im.crop(box)
            w, h = region.size
            region = region.resize((max(1, w // 24), max(1, h // 24)), Image.BILINEAR).resize((w, h), Image.NEAREST)
            im.paste(region.filter(ImageFilter.GaussianBlur(12)), box[:2])
        source = im
        if "crop" in spec:
            im = im.crop(spec["crop"])
        q = spec.get("quality", 82)
        save(width(im, THUMB_W), OUT / f"{key}-800", quality=q)
        save(width(im, FULL_MAX_W), OUT / f"{key}-full", quality=q)
        print(f"{key}: full {width(im, FULL_MAX_W).size}")
        if "mosaic" in spec:
            slice_ = grade(source.crop(spec["mosaic"]))
            save(width(slice_, 640), OUT / f"mosaic-{key}", quality=80)


if __name__ == "__main__":
    main()
