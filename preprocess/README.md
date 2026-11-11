# Generate emoji data

The preprocessing script converts Twemoji SVG artwork into the JSON files
used by EmojiSalon. Run it when updating the source artwork.

## Source of truth

The source is [`jdecked/twemoji`](https://github.com/jdecked/twemoji), the
community-maintained continuation of Twemoji. A pinned release makes the output
reproducible.

- Pinned tag: `v17.0.3` (Unicode 17). Bump `TWEMOJI_TAG` in
  `preprocess/scripts/build-emoji-data.mjs` to update, then re-run.
- SVGs come from `assets/svg/*.svg` in that repo.

## Run

```bash
pnpm preprocess
```

This will:

1. Shallow-clone `jdecked/twemoji` at the pinned tag into `preprocess/twemoji/`
   (git-ignored). If the clone already exists, the script reuses it. Delete that folder
   when changing the pinned release so the script fetches the new version.
2. Parse every `assets/svg/*.svg`, skipping skin-tone-modifier files (they reuse
   the base emoji's paths).
3. Write the output below.

## Output

Emoji path data is served from `public/data/` and fetched on demand by the
editor and Cloudflare Pages OG image function. The small character-to-SVG map
is bundled with the picker so its first grid uses Twemoji thumbnails.

| File                            | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `public/data/emoji/u<code>.json`| One emoji's paths, fills, editable colors    |
| `public/data/index.json`        | `{ version, emojis, chars }`: source version and emoji index |
| `src/data/twemoji-chars.json`   | Character-to-SVG map bundled with the picker |

### Per-emoji JSON shape

```jsonc
// public/data/emoji/u1f600.json
{
  "d": ["M 0,18 A ...", "M18 21c...", ...], // path data, one per drawn element
  "f": ["#ffcc4d", "#664500", ...],         // normalized fill for each d[i]
  "c": ["#ffcc4d", "#664500", "#ffffff"]    // distinct editable colors
}
```

- `d` and `f` have the same length; `f[i]` is the fill for path `d[i]`.
- `f` is normalized: `none`/missing → `#000000`, 3-digit hex expanded, lowercase.
- `<circle>` and `<ellipse>` elements are converted to equivalent path data.

### Palette scheme (color indices)

`c` is the list of **distinct** fill colors in **first-seen order** within `f`.
A color's index is simply its position in `c`. The editor's color pickers and
the share URL both reference colors by this index.

Share URLs encode overrides as `palette=<index>_<hex>` pairs joined by `-`,
For example, `?emoji=u1f600&palette=0_55acee` changes the first color (the
face) to blue. Each emoji has its own palette, so the social preview image
function needs to fetch only that emoji's JSON file.

Recoloring at runtime: for each path, find its fill's index via
`c.indexOf(f[i])`, then substitute the customized color at that index.

## CPAL palette map (for CSS code sharing)

The app's "Share → CSS" feature generates `@font-palette-values` CSS that
works with a Twemoji COLR font. The COLR font uses a global palette table
(CPAL) where each color has a font-wide index (for example, `#ffcc4d` = 1093),
which differs from the per-emoji local indices used by the app internally.

`public/data/cpal-map.json` maps `hex_color → global
CPAL index`. The CSS generator looks up each original color in this map to
emit the correct `override-colors` indices.

### Regenerating the CPAL map

Only needed when the COLR font version changes.

```bash
# 1. Download the font into preprocess/fonts/
mkdir -p preprocess/fonts
curl -sL "https://cdn.jsdelivr.net/npm/@sableclient/twemoji-font@1.0.2/dist/files/twemoji.woff2" \
  -o preprocess/fonts/twemoji-sable-1.0.2.woff2

# 2. Extract the map (requires Python 3 + fonttools)
python3 preprocess/scripts/extract-cpal-map.py \
  preprocess/fonts/twemoji-sable-1.0.2.woff2 \
  --out public/data/cpal-map.json \
  --verify-dir public/data/emoji
```

Current font: [`@sableclient/twemoji-font@1.0.2`](https://github.com/SableClient/twemoji-font)
(99.9% color coverage against jdecked/twemoji v17.0.3 SVGs).

## Categories

The script does not generate category data. If categories are added later,
store them in the index without changing the per-emoji path and palette data.

## Dependencies

- Node.js 26.13.0, as pinned in `.nvmrc` (the script uses only the standard library).
- `git` on PATH (for the shallow clone).
- Python 3 + `fonttools` (only for regenerating `cpal-map.json`).
