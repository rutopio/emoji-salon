#!/usr/bin/env python3
"""
Extract the CPAL palette from a Twemoji COLR font and output a JSON mapping
of hex color -> global palette index.

Usage:
    python3 extract-cpal-map.py <font.woff2> [--out <output.json>]

The script reads palette 0 from the CPAL table and writes:
    { "#rrggbb": index, ... }

It also prints summary stats so we can verify coverage against the SVG data.
"""

import argparse
import json
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

# CSS named colors that appear in some Twemoji SVGs (mainly flags) but aren't
# normalised to hex by the current preprocessor.  We map them here so the CPAL
# lookup can still find a match when the emoji data contains a named color.
CSS_NAMED_COLORS: dict[str, str] = {
    "red": "#ff0000",
    "green": "#008000",
    "blue": "#0000ff",
    "navy": "#000080",
    "white": "#ffffff",
    "black": "#000000",
    "yellow": "#ffff00",
    "orange": "#ffa500",
}


def extract_cpal_map(font_path: str) -> dict[str, int]:
    """Return {lowercase_hex_color: palette_index} from CPAL palette 0."""
    font = TTFont(font_path)

    if "CPAL" not in font:
        print("ERROR: Font has no CPAL table.", file=sys.stderr)
        sys.exit(1)

    cpal = font["CPAL"]
    palette = cpal.palettes[0]  # base palette (palette 0)

    color_map: dict[str, int] = {}
    for idx, color_record in enumerate(palette):
        r, g, b = color_record.red, color_record.green, color_record.blue
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        if hex_color not in color_map:
            color_map[hex_color] = idx

    return color_map


def main():
    parser = argparse.ArgumentParser(description="Extract CPAL palette map from COLR font")
    parser.add_argument("font", help="Path to the woff2/ttf font file")
    parser.add_argument("--out", "-o", help="Output JSON path", default=None)
    parser.add_argument("--verify-dir", help="Directory of per-emoji JSON files to verify coverage")
    args = parser.parse_args()

    color_map = extract_cpal_map(args.font)
    print(f"CPAL palette 0: {len(color_map)} distinct colors")

    # Optionally verify against emoji data
    if args.verify_dir:
        verify_dir = Path(args.verify_dir)
        all_svg_colors: set[str] = set()
        emoji_files = list(verify_dir.glob("u*.json"))
        for f in emoji_files:
            data = json.loads(f.read_text())
            for c in data.get("c", []):
                resolved = CSS_NAMED_COLORS.get(c.lower(), c.lower())
                all_svg_colors.add(resolved)

        matched = all_svg_colors & set(color_map.keys())
        missing = all_svg_colors - set(color_map.keys())
        print(f"SVG distinct colors: {len(all_svg_colors)}")
        print(f"Matched in CPAL:     {len(matched)} ({100*len(matched)/len(all_svg_colors):.1f}%)")
        if missing:
            print(f"Missing from CPAL:   {len(missing)}")
            for c in sorted(missing)[:20]:
                print(f"  {c}")
            if len(missing) > 20:
                print(f"  ... and {len(missing) - 20} more")

    if args.out:
        # Also add CSS named-color aliases so runtime lookups succeed when the
        # emoji data still contains unresolved named colors.
        output_map = dict(color_map)
        for name, hex_val in CSS_NAMED_COLORS.items():
            if hex_val in color_map and name not in output_map:
                output_map[name] = color_map[hex_val]

        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(output_map, indent=2))
        print(f"Written to {out_path} ({len(output_map)} entries)")


if __name__ == "__main__":
    main()
