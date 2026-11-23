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
  return buildEmojiPairWithColors(data, applyOverride(data.c, override));
}

function buildEmojiPairWithColors(
  data: EmojiPathData,
  customized: string[]
): EmojiPair {
  const originalInner = data.d
    .map((d, i) => `<path fill="${data.f[i]}" d="${d}" />`)
    .join("");

  const customizedInner = data.d
    .map((d, i) => {
      const ci = data.c.indexOf(data.f[i] ?? "none");
      const fill = ci !== -1 ? customized[ci] || data.f[i] : data.f[i];
      return `<path fill="${fill}" d="${d}" />`;
    })
    .join("");

  return { originalInner, customizedInner };
}

/** Editor SVGs share the same palette mapping as the server-rendered OG image. */
export function renderEditorEmojiPair(
  data: EmojiPathData,
  customizedColors: string[]
): { originalSvg: string; customizedSvg: string } {
  if (data.d.length === 0 || data.f.length === 0)
    return { originalSvg: "", customizedSvg: "" };

  const { originalInner, customizedInner } = buildEmojiPairWithColors(
    data,
    customizedColors
  );
  const wrap = (inner: string, id?: string) =>
    `<svg${id ? ` id="${id}"` : ""} xmlns="http://www.w3.org/2000/svg" width="16em" height="16em" viewBox="0 0 36 36"><g transform="translate(0,0) scale(1,1)">${inner}</g></svg>`;

  return {
    originalSvg: wrap(originalInner),
    customizedSvg: wrap(customizedInner, "customized-emoji-svg-data"),
  };
}
