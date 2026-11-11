/**
 * @fileoverview Utility functions for EmojiSalon application.
 * Provides functions for emoji manipulation, color conversion,
 * URL encoding/decoding, and data fetching.
 */

import emojiNames from "@/data/emoji-names.json";
import { DEFAULT_EMOJIS } from "@/lib/constants";

/**
 * Preprocessed data for a single emoji, served as a static asset at
 * `/data/emoji/u<code>.json` and fetched on demand.
 */
export interface EmojiSVGData {
  /** Array of SVG path data strings. */
  d: string[];
  /** Normalized fill color for each path (same length as d). */
  f: string[];
  /** Distinct editable colors, first-seen order; index i is the palette index. */
  c: string[];
}

/** In-memory cache of fetched per-emoji data, keyed by unicode id. */
const emojiDataCache = new Map<string, EmojiSVGData>();

/**
 * Converts an RGBA color array to a hex color string.
 *
 * @param rgbaColorArray - Array of color components [R, G, B, A?]. Values should be in the range 0-255.
 * @returns Hex color string with '#' prefix (e.g., "#ff0000").
 *
 * @example
 * rgbaToHexColor([255, 0, 0, 255]); // Returns "#ff0000"
 * rgbaToHexColor([0, 128, 255]);    // Returns "#0080ff"
 */
function rgbaToHexColor(rgbaColorArray: number[]): string {
  return (
    "#" +
    rgbaColorArray
      .slice(0, 3)
      .map((ele) => ele.toString(16))
      .map((ele) => (ele.length === 1 ? `0${ele}` : ele))
      .join("")
  );
}

/**
 * Generates a random hex color.
 *
 * @returns Random hex color string with '#' prefix.
 *
 * @example
 * getRandomColor(); // Returns something like "#a3f21b"
 */
export function getRandomColor(): string {
  const minVal = 0;
  const maxVal = 255;
  const r = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  const g = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  const b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  return rgbaToHexColor([r, g, b, 255]);
}

/**
 * Converts an emoji character to its unicode identifier.
 * Handles basic emojis (single code point), compound emojis with ZWJ (Zero Width Joiner),
 * and emojis with variation selectors (FE0F/FE0E are removed for simple emojis).
 *
 * @param emoji - The emoji character(s) to convert.
 * @returns Unicode identifier in the format "u{codepoint}" or "u{cp1}_{cp2}".
 *
 * @example
 * emojiToUnicode("😀");    // Returns "u1f600"
 * emojiToUnicode("👨‍👩‍👧"); // Returns "u1f468_200d_1f469_200d_1f467"
 */
export function emojiToUnicode(emoji: string): string {
  const res: string[] = [];
  const components = [...emoji];

  components.forEach((component) => {
    if (component.length === 1) {
      // Single byte character (ZWJ or emoji modifier)
      res.push(component.charCodeAt(0).toString(16));
    } else if (component.length === 2) {
      // Surrogate pair - calculate actual code point
      const codePoint =
        (component.charCodeAt(0) - 0xd800) * 0x400 +
        (component.charCodeAt(1) - 0xdc00) +
        0x10000;
      res.push(codePoint.toString(16));
    }
  });

  // Remove trailing variation selector (FE0F or FE0E) for simple emojis
  if (res.length === 2) {
    if (res[res.length - 1] === "fe0f" || res[res.length - 1] === "fe0e") {
      res.pop();
    }
  }

  return `u${res.join("_")}`;
}

/**
 * Converts a unicode identifier back to an emoji character.
 *
 * @param urlCode - Unicode identifier (e.g., "u1f600").
 * @returns The emoji character, or null if invalid.
 *
 * @example
 * unicodeToEmoji("u1f600"); // Returns "😀"
 * unicodeToEmoji("invalid"); // Returns null
 */
export function unicodeToEmoji(urlCode: string): string | null {
  try {
    const fin: string[] = [];
    const codes = urlCode.replace("u", "").split("_");

    codes.forEach((code) => {
      const intCodePoint = parseInt(code, 16);
      const character = String.fromCodePoint(intCodePoint);
      fin.push(character);
    });

    const character = fin.join("");
    const emojisRegex =
      /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\p{Emoji})+$/u;

    if (emojisRegex.test(character)) {
      return character;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches preprocessed data for an emoji from its static asset at
 * `/data/emoji/u<code>.json`. Results are cached in memory per session.
 *
 * @param emoji - The emoji character to fetch data for.
 * @returns Promise resolving to the emoji's data, or null if not found.
 *
 * @example
 * const data = await fetchEmojiData("😀");
 * // data.d = path data, data.f = fills, data.c = distinct editable colors
 */
export async function fetchEmojiData(
  emoji: string
): Promise<EmojiSVGData | null> {
  const unicode = emojiToUnicode(emoji);

  const cached = emojiDataCache.get(unicode);
  if (cached) return cached;

  // Try the id as-is first, then an FE0F-stripped variant. emojiToUnicode keeps
  // embedded FE0F for some sequences (e.g. u1f441_fe0f_200d_1f5e8_fe0f) while
  // the data file drops it (u1f441_200d_1f5e8) — but other ids legitimately
  // contain fe0f, so the original must win when it exists.
  const candidates =
    unicode.includes("_fe0f") && unicode !== unicode.replace(/_fe0f/g, "")
      ? [unicode, unicode.replace(/_fe0f/g, "")]
      : [unicode];

  for (const id of candidates) {
    try {
      const res = await fetch(`/data/emoji/${id}.json`);
      // A missing asset falls back to the SPA shell (text/html, 200), so check
      // for JSON rather than trusting the status code.
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) continue;
      const data = (await res.json()) as EmojiSVGData;
      emojiDataCache.set(unicode, data);
      return data;
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: retain diagnostics for missing or failed emoji assets.
      console.warn(`Failed to fetch emoji data for ${emoji} (${id})`, error);
    }
  }

  // biome-ignore lint/suspicious/noConsole: report exhausted asset fallback attempts.
  console.warn(`No data for emoji: ${emoji} (${unicode})`);
  return null;
}

/**
 * Derives the palette indices and colors for an emoji from its data. With the
 * per-emoji local-index scheme, the index of a color is simply its position in
 * the distinct-color list `c`.
 *
 * @param data - The emoji's preprocessed data.
 * @returns Object with local palette indices and their colors.
 *
 * @example
 * getOriginalPaletteData({ d, f, c: ["#ffcc4d", "#664500"] });
 * // { originalPaletteIndex: [0, 1], originalPaletteColors: ["#ffcc4d", "#664500"] }
 */
export function getOriginalPaletteData(data: EmojiSVGData): {
  originalPaletteIndex: number[];
  originalPaletteColors: string[];
} {
  return {
    originalPaletteIndex: data.c.map((_, i) => i),
    originalPaletteColors: data.c,
  };
}

/**
 * Generates a string representing color overrides for URL encoding.
 * Only includes colors that differ from the original palette.
 * Format: "195_f0daa3-824_6e343f" where each pair is "index_hexcolor".
 * Uses underscore instead of parentheses to avoid URL encoding.
 * All hex values are lowercase for URL consistency.
 *
 * @param customizedPaletteColors - Array of customized colors.
 * @param originalPaletteColors - Array of original colors.
 * @param originalPaletteIndex - Array of palette indices.
 * @returns Override string in format "index_hexcolor-index_hexcolor".
 *
 * @example
 * getOverrideStyleString(
 *   ["#ff0000", "#00ff00"],
 *   ["#ffcc4d", "#00ff00"],
 *   [3, 5]
 * ); // Returns "3_ff0000" (only includes changed colors)
 */
export function getOverrideStyleString(
  customizedPaletteColors: string[],
  originalPaletteColors: string[],
  originalPaletteIndex: number[]
): string {
  return customizedPaletteColors
    .map((color, idx) => {
      // Remove # prefix and convert to lowercase
      const hexColor = color.replace("#", "").toLowerCase();
      return `${originalPaletteIndex[idx]}_${hexColor}`;
    })
    .filter(
      (_, idx) => customizedPaletteColors[idx] !== originalPaletteColors[idx]
    )
    .join("-");
}

/**
 * Parses a palette string from URL format back into color modifications.
 * Expected format: "195_f0daa3-824_6e343f" (case-insensitive).
 *
 * @param paletteString - The palette string from URL.
 * @param originalPaletteColors - Array of original hex color values.
 * @param originalPaletteIndex - Array of palette indices.
 * @returns Array of colors with modifications applied.
 *
 * @example
 * parsePaletteString(
 *   "195_f0daa3-824_6e343f",
 *   ["#ffcc4d", "#f4900c"],
 *   [195, 824]
 * ); // Returns ["#f0daa3", "#6e343f"]
 */
export function parsePaletteString(
  paletteString: string,
  originalPaletteColors: string[],
  originalPaletteIndex: number[]
): string[] {
  const modifiedColors = [...originalPaletteColors];

  // Parse format: "195_F0DAA3-824_6E343F"
  const pairs = paletteString.split("-");
  pairs.forEach((pair) => {
    const match = pair.match(/^(\d+)_([A-Fa-f0-9]{6})$/);
    if (match?.[1] && match[2]) {
      const colorIdx = parseInt(match[1], 10);
      const hexColor = `#${match[2]}`;
      const idx = originalPaletteIndex.indexOf(colorIdx);
      if (idx !== -1) {
        modifiedColors[idx] = hexColor;
      }
    }
  });

  return modifiedColors;
}

/**
 * Gets the label/name for an emoji character.
 *
 * @param emoji - The emoji character.
 * @returns The emoji label/name, or empty string if not found.
 *
 * @example
 * getEmojiLabel("😀"); // Returns "Grinning Face"
 * getEmojiLabel("🦄"); // Returns "Unicorn"
 */
export function getEmojiLabel(emoji: string): string {
  return (emojiNames as Record<string, string>)[emoji] || "";
}

/**
 * Gets a random emoji from the default emoji list.
 *
 * @returns A random emoji character.
 *
 * @example
 * getRandomEmoji(); // Returns a random emoji like "😀" or "🦄"
 */
function getRandomEmoji(): string {
  const randomIndex = Math.floor(Math.random() * DEFAULT_EMOJIS.length);
  return DEFAULT_EMOJIS[randomIndex] ?? "😀";
}

/**
 * Gets a random emoji with its label from the default emoji list.
 *
 * @returns A random emoji with its label.
 *
 * @example
 * getRandomEmojiWithLabel(); // Returns { emoji: "😀", label: "Grinning Face" }
 */
export function getRandomEmojiWithLabel(): { emoji: string; label: string } {
  const emoji = getRandomEmoji();
  const label = getEmojiLabel(emoji);
  return { emoji, label };
}

/**
 * Triggers a file download in the browser.
 * Creates a temporary anchor element to initiate the download.
 *
 * @param uri - The data URI or blob URL of the file.
 * @param fileName - The name for the downloaded file.
 *
 * @example
 * triggerDownload("data:image/png;base64,...", "emoji.png");
 * triggerDownload(blobUrl, "emoji-salon.svg");
 */
export function triggerDownload(uri: string, fileName: string): void {
  const a = document.createElement("a");
  a.setAttribute("download", fileName);
  a.setAttribute("href", uri);
  a.setAttribute("target", "_blank");
  a.click();
}
