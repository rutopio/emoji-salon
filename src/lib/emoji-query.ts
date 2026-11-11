import { queryOptions } from "@tanstack/react-query";
import { fetchEmojiData } from "./emoji-utils";

export function emojiQueryOptions(emoji: string) {
  return queryOptions({
    queryKey: ["emoji", emoji],
    queryFn: async () => {
      const data = await fetchEmojiData(emoji);
      if (!data) throw new Error("Could not load this emoji.");
      return data;
    },
    staleTime: Infinity,
    retry: false,
    retryOnMount: false,
  });
}
