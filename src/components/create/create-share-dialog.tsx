/**
 * @fileoverview Share dialog component for sharing customized emoji on the Create page.
 * Wraps the shared ShareDialog with data sourced from EmojiContext.
 */

import ShareDialog from "@/components/shared/share-dialog";
import { useEmoji } from "@/contexts/emoji-context";
import { useT } from "@/lib/translations";

/**
 * Share dialog for the Create page. Reads state from EmojiContext and delegates
 * rendering to the shared ShareDialog component.
 *
 * @returns Share dialog dialog component.
 */
export default function CreateShareDialog() {
  const t = useT();
  const {
    currentEmoji,
    currentEmojiLabel,
    svgHTML,
    shareDialogOpen,
    setShareDialogOpen,
    customizedPaletteColors,
    originalPaletteColors,
  } = useEmoji();

  return (
    <ShareDialog
      open={shareDialogOpen}
      onOpenChange={setShareDialogOpen}
      shareUrl={window.location.href}
      svgHTML={svgHTML}
      emojiLabel={`${t("Customized emoji")} ${t(currentEmojiLabel || currentEmoji)}`}
      emoji={currentEmoji}
      customizedPaletteColors={customizedPaletteColors}
      originalPaletteColors={originalPaletteColors}
      showSubmitShowcase
    />
  );
}
