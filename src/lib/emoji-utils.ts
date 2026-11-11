import emojiNames from "@/data/emoji-names.json";
import { DEFAULT_EMOJIS } from "@/lib/constants";
import type { EmojiPathData } from "./emoji-path-data";

const EMOJI_CHARACTER_RE =
  /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\p{Emoji})+$/u;
const VARIATION_SELECTOR_ID_RE = /_fe0f/g;
const PALETTE_OVERRIDE_RE = /^(\d+)_([A-Fa-f0-9]{6})$/;

const emojiDataCache = new Map<string, EmojiPathData>();
const pendingEmojiData = new Map<string, Promise<EmojiPathData | null>>();

/** RGB channels are bytes; alpha is ignored. */
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

export function getRandomColor(): string {
  const minVal = 0;
  const maxVal = 255;
  const r = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  const g = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  const b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  return rgbaToHexColor([r, g, b, 255]);
}

/** Asset ID format: u1f600 or u1f468_200d_1f469. */
export function emojiToUnicode(emoji: string): string {
  const res: string[] = [];
  const components = [...emoji];

  components.forEach((component) => {
    if (component.length === 1) {
      res.push(component.charCodeAt(0).toString(16));
    } else if (component.length === 2) {
      // Decode a UTF-16 surrogate pair.
      const codePoint =
        (component.charCodeAt(0) - 0xd800) * 0x400 +
        (component.charCodeAt(1) - 0xdc00) +
        0x10000;
      res.push(codePoint.toString(16));
    }
  });

  // Single-code-point emoji assets omit the optional presentation selector.
  if (res.length === 2) {
    if (res[res.length - 1] === "fe0f" || res[res.length - 1] === "fe0e") {
      res.pop();
    }
  }

  return `u${res.join("_")}`;
}

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
    const emojisRegex = EMOJI_CHARACTER_RE;

    if (emojisRegex.test(character)) {
      return character;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchEmojiData(
  emoji: string
): Promise<EmojiPathData | null> {
  const unicode = emojiToUnicode(emoji);

  const cached = emojiDataCache.get(unicode);
  if (cached) return cached;
  const pending = pendingEmojiData.get(unicode);
  if (pending) return pending;
  const loading = loadEmojiData(emoji, unicode).finally(() => {
    pendingEmojiData.delete(unicode);
  });
  pendingEmojiData.set(unicode, loading);
  return loading;
}

async function loadEmojiData(
  emoji: string,
  unicode: string
): Promise<EmojiPathData | null> {
  // Prefer the exact ID: some assets retain FE0F while others omit it.
  const candidates =
    unicode.includes("_fe0f") &&
    unicode !== unicode.replace(VARIATION_SELECTOR_ID_RE, "")
      ? [unicode, unicode.replace(VARIATION_SELECTOR_ID_RE, "")]
      : [unicode];

  for (const id of candidates) {
    try {
      const res = await fetch(`/data/emoji/${id}.json`);
      // Missing assets may return the HTML SPA shell with status 200.
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) continue;
      const data = (await res.json()) as EmojiPathData;
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

export function getOriginalPaletteData(data: EmojiPathData): {
  originalPaletteIndex: number[];
  originalPaletteColors: string[];
} {
  return {
    originalPaletteIndex: data.c.map((_, i) => i),
    originalPaletteColors: data.c,
  };
}

/** Encode changed colors as local-index_hex pairs joined by hyphens. */
export function getOverrideStyleString(
  customizedPaletteColors: string[],
  originalPaletteColors: string[],
  originalPaletteIndex: number[]
): string {
  return customizedPaletteColors
    .map((color, idx) => {
      const hexColor = color.replace("#", "").toLowerCase();
      return `${originalPaletteIndex[idx]}_${hexColor}`;
    })
    .filter(
      (_, idx) => customizedPaletteColors[idx] !== originalPaletteColors[idx]
    )
    .join("-");
}

export function parsePaletteString(
  paletteString: string,
  originalPaletteColors: string[],
  originalPaletteIndex: number[]
): string[] {
  const modifiedColors = [...originalPaletteColors];

  const pairs = paletteString.split("-");
  pairs.forEach((pair) => {
    const match = pair.match(PALETTE_OVERRIDE_RE);
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

export function getEmojiLabel(emoji: string): string {
  return (emojiNames as Record<string, string>)[emoji] || "";
}

function getRandomEmoji(): string {
  const randomIndex = Math.floor(Math.random() * DEFAULT_EMOJIS.length);
  return DEFAULT_EMOJIS[randomIndex] ?? "😀";
}

export function getRandomEmojiWithLabel(): { emoji: string; label: string } {
  const emoji = getRandomEmoji();
  const label = getEmojiLabel(emoji);
  return { emoji, label };
}

export function triggerDownload(uri: string, fileName: string): void {
  const a = document.createElement("a");
  a.setAttribute("download", fileName);
  a.setAttribute("href", uri);
  a.setAttribute("target", "_blank");
  a.click();
}
