/**
 * @fileoverview Share dialog component for the Showcase page.
 * Wraps the shared ShareDialog with showcase-specific props.
 * Generates a shareable URL pointing to the Create page with the
 * emoji and palette pre-selected.
 */

import ShareDialog from "@/components/shared/share-dialog";
import { generateShareURL } from "@/lib/share-utils";

/**
 * Props for the ShowcaseShareDialog component.
 */
interface ShowcaseShareDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Emoji character. */
  emoji: string;
  /** Palette override string used to generate the shareable URL. */
  palette: string;
  /** Inline SVG HTML string for the preview image. */
  svgHTML?: string;
  /** Accessible label for the emoji preview. */
  emojiLabel?: string;
  /** Customized palette colors for the CSS code section. */
  customizedPaletteColors: string[];
  /** Original palette colors for the CSS code section. */
  originalPaletteColors: string[];
}

/**
 * Share dialog for Showcase cards. Builds a shareable URL for the emoji
 * and delegates rendering to the shared ShareDialog component.
 *
 * @param props - Component props.
 * @returns Showcase share dialog component.
 */
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
