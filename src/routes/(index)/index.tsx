/**
 * @fileoverview Main emoji customization page route.
 * Provides the interface for selecting emojis, customizing colors,
 * and downloading or sharing customized emojis.
 */

import { createFileRoute } from "@tanstack/react-router";
import ActionButtons from "@/components/create/action-buttons";
import ColorPalettePickers from "@/components/create/color-palette-pickers";
import EmojiDisplay from "@/components/create/emoji-display";
import DesktopEmojiPicker from "@/components/create/emoji-picker";
import ShareModal from "@/components/create/share-modal";
import { EmojiProvider, useEmoji } from "@/contexts/emoji-context";
import PageLayout from "@/layout";
import { pageHead } from "@/lib/page-meta";
import { useT } from "@/lib/translations";

/**
 * Search parameters for the emoji customization page.
 */
interface EmojiSearchParams {
  /** Unicode emoji identifier from URL. */
  emoji?: string;
  /** Palette override string from URL. */
  palette?: string;
}

/**
 * Main emoji customization page route configuration.
 * Validates search parameters and provides page metadata.
 */
export const Route = createFileRoute("/(index)/")({
  component: EmojiSalonPage,
  validateSearch: (search: Record<string, unknown>): EmojiSearchParams => {
    return {
      emoji: typeof search.emoji === "string" ? search.emoji : undefined,
      palette: typeof search.palette === "string" ? search.palette : undefined,
    };
  },
  head: () => pageHead("en", "create"),
});

/**
 * Main emoji customization page component.
 * Displays emoji picker, color customization controls, and emoji previews.
 * Shows loading spinner during SSR to prevent hydration mismatches.
 *
 * @returns Emoji customization page component.
 */
export function EmojiSalonPage() {
  return (
    <EmojiProvider>
      <EmojiSalonContent />
    </EmojiProvider>
  );
}

function EmojiSalonContent() {
  const { canvasRef } = useEmoji();
  const t = useT();

  return (
    <PageLayout>
      {/* Hidden canvas for image export */}
      <canvas ref={canvasRef} className="hidden" width={256} height={256} />

      <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-16 py-6 sm:py-12 lg:w-[calc(100vw-3rem)] lg:max-w-5xl lg:flex-none">
        <h1 className="sr-only">{t("Create Your Custom Emoji")}</h1>
        <div className="grid grid-cols-1 items-center lg:grid-cols-3 lg:gap-16">
          <DesktopEmojiPicker />
          <ActionButtons variant="mobile" />
          <EmojiDisplay variant="customized" />
          <EmojiDisplay variant="reference" />
        </div>

        <ActionButtons variant="desktop" />
        <ColorPalettePickers />
      </div>

      <ShareModal />
    </PageLayout>
  );
}
