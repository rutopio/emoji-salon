import ShareDialog from "@/components/feedback/share-dialog";
import { generateShareURL } from "@/lib/share-utils";

interface ShowcaseShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emoji: string;
  /** Palette override string used to generate the shareable URL. */
  palette: string;
  svgHTML?: string;
  emojiLabel?: string;
  customizedPaletteColors: string[];
  originalPaletteColors: string[];
}

export default function ShowcaseShareDialog({
  open,
  onOpenChange,
  emoji,
  palette,
  svgHTML,
  emojiLabel,
  customizedPaletteColors,
  originalPaletteColors,
}: ShowcaseShareDialogProps) {
  const shareUrl = generateShareURL(emoji, palette);

  return (
    <ShareDialog
      open={open}
      onOpenChange={onOpenChange}
      shareUrl={shareUrl}
      svgHTML={svgHTML}
      emojiLabel={emojiLabel}
      emoji={emoji}
      customizedPaletteColors={customizedPaletteColors}
      originalPaletteColors={originalPaletteColors}
      showSubmitShowcase={false}
    />
  );
}
