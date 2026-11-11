import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { emojiQueryOptions } from "./emoji-query";
import {
  emojiToUnicode,
  getEmojiLabel,
  getRandomEmojiWithLabel,
  unicodeToEmoji,
} from "./emoji-utils";

export interface EmojiSearchParams {
  emoji?: string;
  palette?: string;
}

export function resolveInitialEmoji(search: EmojiSearchParams) {
  const fromURL = search.emoji && unicodeToEmoji(search.emoji);
  if (fromURL)
    return {
      emoji: fromURL,
      label: getEmojiLabel(fromURL),
      palette: search.palette,
    };
  try {
    const stored = localStorage.getItem("emojisalon:emoji");
    const emoji = stored && unicodeToEmoji(stored);
    if (emoji)
      return {
        emoji,
        label: getEmojiLabel(emoji),
        palette: localStorage.getItem("emojisalon:palette") || undefined,
      };
  } catch {
    // A random selection also works when storage is unavailable.
  }
  return { ...getRandomEmojiWithLabel(), palette: undefined };
}

/** Normalize the starting URL before the editor mounts. Preloading has no side effects. */
export async function prepareEmojiRoute({
  search,
  preload,
  location,
  context,
  abortController,
}: {
  search: EmojiSearchParams;
  preload: boolean;
  location: { pathname: string };
  context: { queryClient: QueryClient };
  abortController: AbortController;
}) {
  if (preload || typeof window === "undefined") return;
  const selection = resolveInitialEmoji(search);
  const emoji = emojiToUnicode(selection.emoji);
  if (search.emoji !== emoji)
    throw redirect({
      to: location.pathname.startsWith("/zh_tw")
        ? "/zh_tw"
        : location.pathname.startsWith("/ja")
          ? "/ja"
          : "/",
      search: { emoji, palette: selection.palette },
      replace: true,
    });
  // Share the query with the editor. A failed or superseded load must not
  // replace the last usable selection in storage.
  try {
    await context.queryClient.fetchQuery(emojiQueryOptions(selection.emoji));
  } catch {
    return;
  }
  if (abortController.signal.aborted) return;
  try {
    localStorage.setItem("emojisalon:emoji", emoji);
    if (selection.palette)
      localStorage.setItem("emojisalon:palette", selection.palette);
    else localStorage.removeItem("emojisalon:palette");
  } catch {
    // Share URLs remain usable when storage is unavailable.
  }
}
