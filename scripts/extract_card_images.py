#!/usr/bin/env python3
"""
Downloads card images from the Riftbound card gallery (playriftbound.com)
and saves them into frontend/public/TempCards named by their card ID
(e.g. VEN-001.png, VEN-007a.png).

Usage:
    python scripts/extract_card_images.py --set VEN
    python scripts/extract_card_images.py --set VEN --out frontend/public/TempCards --force
    python scripts/extract_card_images.py --list-sets
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path

import requests

GALLERY_URL = "https://playriftbound.com/en-us/card-gallery/"
NEXT_DATA_RE = re.compile(
    r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.DOTALL
)
REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = REPO_ROOT / "frontend" / "public" / "TempCards"


def fetch_gallery_cards():
    resp = requests.get(GALLERY_URL, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    match = NEXT_DATA_RE.search(resp.text)
    if not match:
        raise RuntimeError("Could not find __NEXT_DATA__ on the gallery page")

    data = json.loads(match.group(1))
    blades = data["props"]["pageProps"]["page"]["blades"]
    gallery = next(b for b in blades if b["type"] == "riftboundCardGallery")
    return gallery["cards"]["items"], gallery["sets"]["items"]


def card_filename(public_code: str) -> str:
    # "VEN-001/166" -> "VEN-001", "VEN-SP3/006" -> "VEN-SP3", "VEN-R04" -> "VEN-R04"
    return public_code.split("/")[0]


def extension_for(mime_type: str) -> str:
    return {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
    }.get(mime_type, ".png")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--set", dest="set_code", help="Set code to extract, e.g. VEN (omit for all sets)")
    parser.add_argument("--out", dest="out_dir", default=str(DEFAULT_OUT), help="Output directory")
    parser.add_argument("--force", action="store_true", help="Re-download files that already exist")
    parser.add_argument("--list-sets", action="store_true", help="List available set codes and exit")
    args = parser.parse_args()

    print(f"Fetching card gallery data from {GALLERY_URL} ...")
    cards, sets_ = fetch_gallery_cards()
    print(f"Loaded {len(cards)} cards across {len(sets_)} sets.")

    if args.list_sets:
        for s in sets_:
            count = sum(1 for c in cards if c["set"]["value"]["id"] == s["id"])
            print(f"  {s['id']:6s} {s['name']:20s} ({count} cards loaded)")
        return

    if args.set_code:
        set_code = args.set_code.upper()
        cards = [c for c in cards if c["set"]["value"]["id"] == set_code]
        if not cards:
            print(f"No cards found for set '{set_code}'. Use --list-sets to see options.", file=sys.stderr)
            sys.exit(1)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    downloaded, skipped, failed = 0, 0, 0
    for card in cards:
        public_code = card.get("publicCode")
        image = card.get("cardImage")
        if not public_code or not image or not image.get("url"):
            print(f"  skip (missing data): {card.get('id')}")
            skipped += 1
            continue

        filename = card_filename(public_code) + extension_for(image.get("mimeType", "image/png"))
        dest = out_dir / filename

        if dest.exists() and not args.force:
            skipped += 1
            continue

        try:
            img_resp = requests.get(image["url"], timeout=30)
            img_resp.raise_for_status()
            dest.write_bytes(img_resp.content)
            downloaded += 1
            print(f"  saved {filename} ({len(img_resp.content) // 1024} KB)")
        except requests.RequestException as e:
            print(f"  FAILED {filename}: {e}", file=sys.stderr)
            failed += 1

        time.sleep(0.05)  # be polite to the CDN

    print(f"\nDone. Downloaded={downloaded} Skipped(existing)={skipped} Failed={failed}")
    print(f"Output directory: {out_dir}")


if __name__ == "__main__":
    main()
