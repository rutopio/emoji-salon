import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-meta";
import { prepareEmojiRoute } from "@/lib/prepare-emoji-route";
import { EmojiSalonPage } from "@/routes/(index)/index";

export const Route = createFileRoute("/zh_tw/")({
  component: EmojiSalonPage,
  beforeLoad: prepareEmojiRoute,
  head: () => pageHead("zh-TW", "create"),
  validateSearch: (search: Record<string, unknown>) => ({
    emoji: typeof search.emoji === "string" ? search.emoji : undefined,
    palette: typeof search.palette === "string" ? search.palette : undefined,
  }),
});
