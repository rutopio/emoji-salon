/**
 * Pure, platform-agnostic emoji SVG builder. Given one emoji's preprocessed
 * data ({ d, f, c }) it produces the original and customized (palette-
 * overridden) inner SVG, without React or the browser, so it is reused by the
 * Cloudflare Pages OG image function and the dev server.
 *
 * Palette scheme C: a color's index is its position in `c` (distinct fills in
 * first-seen order). Overrides are encoded in share URLs as "<index>_<hex>".
 * Self-contained per emoji: no global color table.
 */

/** Preprocessed data for a single emoji (public/data/emoji/u<code>.json). */
export interface EmojiData {
  /** Path data, one entry per drawn element. */
  d: string[];
  /** Normalized fill color for each path (same length as d). */
  f: string[];
  /** Distinct editable colors, first-seen order; index i is the palette index. */
  c: string[];
}

/** Both SVGs for one emoji: original palette and user-customized palette. */
interface EmojiPair {
  /** Original emoji inner SVG (just `<path>` elements, viewBox 0 0 36 36). */
  originalInner: string;
  /** Customized emoji inner SVG (just `<path>` elements, viewBox 0 0 36 36). */
  customizedInner: string;
}

/**
 * Apply a URL override string ("0_55acee-2_ff0000") to an emoji's distinct
 * color list `c`, returning the customized colors (same length/order as `c`).
 * Unknown or out-of-range indices are ignored.
 */
function applyOverride(c: string[], override?: string): string[] {
  const colors = [...c];
  if (!override) return colors;
  for (const pair of override.split("-")) {
    const m = pair.match(/^(\d+)_([0-9a-fA-F]{6})$/);
    if (m?.[1] && m[2]) {
      const idx = Number(m[1]);
      if (idx >= 0 && idx < colors.length)
        colors[idx] = `#${m[2].toLowerCase()}`;
    }
  }
  return colors;
}

/**
 * Build original + customized inner SVG (just the `<path>` elements) for an
 * emoji from its preprocessed data.
 *
 * @param data - The emoji's { d, f, c } data.
 * @param override - Optional override string, e.g. "0_55acee".
 */
export function buildEmojiPair(data: EmojiData, override?: string): EmojiPair {
  const customized = applyOverride(data.c, override);

  const originalInner = data.d
    .map((d, i) => `<path fill="${data.f[i]}" d="${d}" />`)
    .join("");

  const customizedInner = data.d
    .map((d, i) => {
      const ci = data.c.indexOf(data.f[i] ?? "none");
      const fill = ci !== -1 ? customized[ci] : data.f[i];
      return `<path fill="${fill}" d="${d}" />`;
    })
    .join("");

  return { originalInner, customizedInner };
}
