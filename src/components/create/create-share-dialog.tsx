import ShareDialog from "@/components/feedback/share-dialog";
import { useEmoji } from "@/contexts/emoji-context";
import { useT } from "@/hooks/use-translation";

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
