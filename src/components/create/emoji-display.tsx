/**
 * @fileoverview Emoji display component for showing customized or reference emoji.
 * Renders SVG content for either the customized emoji or the original reference emoji.
 */

import { useEmoji } from "@/contexts/emoji-context";
import { useT } from "@/hooks/use-translation";

/**
 * Props for the EmojiDisplay component.
 */
interface EmojiDisplayProps {
  /** Display variant: 'customized' shows the user's customized emoji, 'reference' shows the original. */
  variant?: "customized" | "reference";
}

/**
 * Displays the emoji SVG content based on the selected variant.
 * Shows either the customized emoji or the original reference emoji.
 *
 * @param props - Component props.
 * @returns Emoji display with appropriate SVG content.
 */
export default function EmojiDisplay({
  variant = "customized",
}: EmojiDisplayProps) {
  const t = useT();
  const { svgHTML, referenceSvgHTML, currentEmoji } = useEmoji();

  const svgContent = variant === "reference" ? referenceSvgHTML : svgHTML;
  const label =
    variant === "reference"
      ? `${t("Original emoji")} ${currentEmoji}`
      : `${t("Customized emoji")} ${currentEmoji}`;

  if (variant === "reference") {
    return (
      <div className="hidden items-center justify-center lg:flex">
        <div
          role="img"
          aria-label={label}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is generated from bundled emoji paths and validated palette colors.
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="size-64"
        />
      </div>
    );
  }

  return (
    <div className="my-8 flex items-center justify-center lg:my-0">
      <div
        role="img"
        aria-label={label}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is generated from bundled emoji paths and validated palette colors.
        dangerouslySetInnerHTML={{ __html: svgContent }}
        className="size-64"
      />
    </div>
  );
}
