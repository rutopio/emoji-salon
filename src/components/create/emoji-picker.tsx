/**
 * @fileoverview Emoji picker built on frimousse (headless) with self-hosted
 * Twemoji thumbnails. Each cell renders the jdecked Twemoji SVG copied to
 * /twemoji during preprocessing, so the picker preview matches the editor and
 * OG image (one source of truth).
 *
 * @see https://frimousse.liveblocks.io
 */

import { useQuery } from "@tanstack/react-query";
import {
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
  EmojiPicker as Frimousse,
} from "frimousse";
import { useTheme } from "next-themes";

import { useEmoji } from "@/contexts/emoji-context";
import { useT } from "@/lib/translations";
import { useLocale } from "@/lib/use-locale";

/** Maps an emoji character to its Twemoji filename stem (from index.json). */
type CharMap = Record<string, string>;

/**
 * Session-global char -> filename map. Loaded once; read by the hoisted Emoji
 * button (frimousse fixes the component signature, so we can't pass it as a
 * prop). It is immutable after load, so a module-level value is safe.
 */
let charMap: CharMap = {};
let charMapPromise: Promise<CharMap> | null = null;
function loadCharMap(): Promise<CharMap> {
  if (!charMapPromise) {
    charMapPromise = fetch("/data/index.json")
      .then((res) => res.json())
      .then((json: { chars?: CharMap }) => {
        charMap = json.chars ?? {};
        return charMap;
      })
      .catch(() => charMap);
  }
  return charMapPromise;
}

/** Sticky category header. */
function CategoryHeader({
  category,
  ...props
}: EmojiPickerListCategoryHeaderProps) {
  return (
    <div
      className="bg-popover px-3 pt-3 pb-1.5 font-medium text-muted-foreground text-xs"
      {...props}
    >
      {category.label}
    </div>
  );
}

/** A row of emoji buttons. */
function Row({ children, ...props }: EmojiPickerListRowProps) {
  return (
    <div className="scroll-my-1 px-1" {...props}>
      {children}
    </div>
  );
}

/** Variation selector emojibase appends but Twemoji filenames usually omit. */
const FE0F = "️";

/**
 * Resolve an emoji character to its Twemoji filename stem. emojibase reports
 * many emoji with a trailing/embedded FE0F that the Twemoji filename drops, so
 * fall back to FE0F-stripped variants. Lifts coverage from ~81% to ~99.7%.
 */
function stemFor(char: string): string | undefined {
  return (
    charMap[char] ??
    charMap[char.replace(new RegExp(`${FE0F}$`), "")] ??
    charMap[char.replaceAll(FE0F, "")]
  );
}

/** One emoji button, rendered as a self-hosted Twemoji thumbnail. */
function EmojiButton({ emoji, ...props }: EmojiPickerListEmojiProps) {
  const stem = stemFor(emoji.emoji);
  return (
    <button
      type="button"
      className="flex size-9 items-center justify-center rounded-md data-[active]:bg-secondary"
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

/**
 * Props for the EmojiPicker component.
 */
interface EmojiPickerProps {
  /**
   * Callback invoked when an emoji is selected.
   *
   * @param emoji - The selected emoji character.
   * @param label - The label/name of the emoji.
   */
  onEmojiSelect: (emoji: string, label: string) => void;
}

/**
 * Emoji picker with self-hosted Twemoji thumbnails.
 * Displays a searchable, scrollable emoji grid.
 *
 * @param props - Component props.
 * @returns Emoji picker UI component.
 */
export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const t = useT();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const { isSuccess: charMapReady } = useQuery({
    queryKey: ["emoji-char-map"],
    queryFn: loadCharMap,
    staleTime: Number.POSITIVE_INFINITY,
  });

  return (
    <Frimousse.Root
      key={charMapReady ? "ready" : "loading"}
      locale={locale === "zh-TW" ? "zh-hant" : locale}
      onEmojiSelect={({ emoji, label }) => onEmojiSelect(emoji, label)}
      columns={8}
      className="isolate flex h-[352px] w-[312px] flex-col rounded-[var(--radius)] border bg-popover text-popover-foreground shadow-md"
      data-theme={resolvedTheme === "dark" ? "dark" : "light"}
    >
      <Frimousse.Search
        placeholder={t("Search emoji")}
        className="z-10 mx-2 mt-2 appearance-none rounded-md bg-secondary px-2.5 py-2 text-secondary-foreground text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Frimousse.Viewport className="relative flex-1 outline-none">
        <Frimousse.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          {t("Loading…")}
        </Frimousse.Loading>
        <Frimousse.Empty className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          {t("No emoji found.")}
        </Frimousse.Empty>
        <Frimousse.List
          className="select-none pb-2"
          components={LIST_COMPONENTS}
        />
      </Frimousse.Viewport>
    </Frimousse.Root>
  );
}

/**
 * Desktop emoji picker component.
 * Wraps the EmojiPicker component and is only visible on large screens.
 * Uses the emoji context for handling emoji selection.
 *
 * @returns Desktop emoji picker component (hidden on mobile).
 */
export default function DesktopEmojiPicker() {
  const { handleEmojiSelect } = useEmoji();

  return (
    <div className="hidden lg:block">
      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
    </div>
  );
}
