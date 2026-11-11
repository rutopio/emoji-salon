/** Load showcase emoji data through React Query and derive each SVG from it. */
import { useQuery } from "@tanstack/react-query";
import type { EmojiPathData } from "@/lib/emoji-path-data";
import {
  fetchEmojiData,
  getEmojiLabel,
  getOriginalPaletteData,
  parsePaletteString,
  unicodeToEmoji,
} from "@/lib/emoji-utils";

function useShowcaseEmojiData(unicode: string) {
  const emoji = unicodeToEmoji(unicode);
  const query = useQuery({
    queryKey: ["showcase-emoji", unicode],
    queryFn: async () => {
      const data = await fetchEmojiData(emoji ?? "");
      if (!data) throw new Error("Emoji data unavailable");
      return data;
    },
    enabled: Boolean(emoji),
    staleTime: Number.POSITIVE_INFINITY,
  });
  return {
    emoji,
    data: query.data,
    isLoading: Boolean(emoji) && query.isPending,
  };
}

function renderSvg(data: EmojiPathData, colors: string[]) {
  const original = getOriginalPaletteData(data).originalPaletteColors;
  const paths = data.d.map((path, index) => {
    const originalColor = data.f[index] ?? "none";
    const colorIndex = original.indexOf(originalColor);
    const fill =
      colorIndex < 0 ? originalColor : (colors[colorIndex] ?? originalColor);
    return `<path fill="${fill}" d="${path}" />`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">${paths.join("")}</svg>`;
}

export function useEmojiSVG(unicode: string, palette?: string) {
  const { emoji, data, isLoading } = useShowcaseEmojiData(unicode);
  if (!data) {
    return {
      originalSvg: "",
      modifiedSvg: "",
      originalName: emoji ? getEmojiLabel(emoji) : "",
      isLoading,
      customizedPaletteColors: [] as string[],
      originalPaletteColors: [] as string[],
      originalPaletteIndex: [] as number[],
    };
  }

  const { originalPaletteColors, originalPaletteIndex } =
    getOriginalPaletteData(data);
  const customizedPaletteColors = palette
    ? parsePaletteString(palette, originalPaletteColors, originalPaletteIndex)
    : originalPaletteColors;
  return {
    originalSvg: renderSvg(data, originalPaletteColors),
    modifiedSvg: renderSvg(data, customizedPaletteColors),
    originalName: getEmojiLabel(emoji ?? ""),
    isLoading,
    customizedPaletteColors,
    originalPaletteColors,
    originalPaletteIndex,
  };
}

export function useVariantSVG(unicode: string, palette: string) {
  const { data, isLoading } = useShowcaseEmojiData(unicode);
  if (!data) return { svg: "", isLoading };
  const { originalPaletteColors, originalPaletteIndex } =
    getOriginalPaletteData(data);
  const colors = parsePaletteString(
    palette,
    originalPaletteColors,
    originalPaletteIndex
  );
  return { svg: renderSvg(data, colors), isLoading };
}
