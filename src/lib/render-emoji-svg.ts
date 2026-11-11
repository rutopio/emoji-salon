import type { EmojiPathData } from "./emoji-path-data";

const PALETTE_OVERRIDE_RE = /^(\d+)_([0-9a-fA-F]{6})$/;

/** Inner paths in 36x36 SVG coordinates, without an outer svg element. */
interface EmojiPair {
  originalInner: string;
  customizedInner: string;
}

/** Overrides address local indices in c, not global font palette indices. */
function applyOverride(c: string[], override?: string): string[] {
  const colors = [...c];
  if (!override) return colors;
  for (const pair of override.split("-")) {
    const m = pair.match(PALETTE_OVERRIDE_RE);
    if (m?.[1] && m[2]) {
      const idx = Number(m[1]);
      if (idx >= 0 && idx < colors.length)
        colors[idx] = `#${m[2].toLowerCase()}`;
    }
  }
  return colors;
}

export function buildEmojiPair(
  data: EmojiPathData,
  override?: string
): EmojiPair {
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
