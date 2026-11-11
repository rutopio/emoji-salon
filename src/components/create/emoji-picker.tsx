// https://frimousse.liveblocks.io
// Use the same Twemoji thumbnails as the editor and share previews.

import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as Frimousse,
} from "frimousse";
import { useTheme } from "next-themes";

import { useEmoji } from "@/contexts/emoji-context";
import charMap from "@/data/twemoji-chars.json";
import { useLocale } from "@/hooks/use-locale";
import { useT } from "@/hooks/use-translation";

const TRAILING_VARIATION_SELECTOR_RE = /\uFE0F$/;

const twemojiCharMap: Record<string, string> = charMap;

function CategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      className="bg-popover text-muted-foreground px-3 pt-3 pb-1.5 text-sm font-semibold"
      {...props}
    >
      {category.label}
    </div>
  );
}

function Row({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div className="scroll-my-1 px-1" {...props}>
      {children}
    </div>
  );
}

/** Variation selector emojibase appends but Twemoji filenames usually omit. */
const FE0F = "️";

// Twemoji may omit FE0F even when the picker includes it; prefer the exact asset first.
function stemFor(char: string): string | undefined {
  return (
    twemojiCharMap[char] ??
    twemojiCharMap[char.replace(TRAILING_VARIATION_SELECTOR_RE, "")] ??
    twemojiCharMap[char.replaceAll(FE0F, "")]
  );
}

function EmojiButton({ emoji, ...props }: EmojiPickerListEmojiProps) {
  const stem = stemFor(emoji.emoji);
  return (
    <button
      type="button"
      className="focus-visible:ring-ring data-[active]:bg-secondary flex size-9 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
      {...props}
    >
      {stem ? (
        <img
          src={`/twemoji/${stem}.svg`}
          alt={emoji.label}
          loading="lazy"
          className="size-7"
        />
      ) : (
        <span className="text-2xl">{emoji.emoji}</span>
      )}
    </button>
  );
}

const LIST_COMPONENTS = {
  CategoryHeader,
  Row,
  Emoji: EmojiButton,
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string, label: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const t = useT();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  return (
    <Frimousse.Root
      locale={locale === "zh-TW" ? "zh-hant" : locale}
      onEmojiSelect={({ emoji, label }) => onEmojiSelect(emoji, label)}
      columns={8}
      className="bg-popover text-popover-foreground isolate flex h-[352px] w-[312px] flex-col rounded-[var(--radius)] border shadow-md"
      data-theme={resolvedTheme === "dark" ? "dark" : "light"}
    >
      <Frimousse.Search
        aria-label={t("Search emoji")}
        placeholder={t("Search emoji")}
        className="bg-secondary text-secondary-foreground placeholder:text-muted-foreground focus-visible:ring-ring z-10 mx-2 mt-2 appearance-none rounded-md px-2.5 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
      />
      <Frimousse.Viewport className="relative flex-1 outline-none">
        <Frimousse.Loading className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
          {t("Loading…")}
        </Frimousse.Loading>
        <Frimousse.Empty className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
          {t("No emoji found.")}
        </Frimousse.Empty>
        <Frimousse.List
          className="pb-2 select-none"
          components={LIST_COMPONENTS}
        />
      </Frimousse.Viewport>
    </Frimousse.Root>
  );
}

export default function DesktopEmojiPicker() {
  const { handleEmojiSelect } = useEmoji();

  return (
    <div className="hidden lg:block">
      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
    </div>
  );
}
