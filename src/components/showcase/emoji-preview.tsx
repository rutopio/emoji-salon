/**
 * @fileoverview Emoji preview component for displaying emoji SVG with label.
 * Shows a loading skeleton while the emoji is being loaded, then displays
 * the emoji SVG with an optional label below it.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/hooks/use-translation";

/**
 * Props for the EmojiPreview component.
 */
interface EmojiPreviewProps {
  /** SVG string content to display. */
  svg: string;
  /** Label text displayed below the emoji. */
  label: string;
  /** Whether the emoji is currently loading. */
  isLoading?: boolean;
}

/**
 * Emoji preview component that displays an emoji SVG with a label.
 * Shows a loading skeleton while the emoji is being loaded.
 *
 * @param props - Component props.
 * @returns Emoji preview component with optional label.
 */
export default function EmojiPreview({
  svg,
  label,
  isLoading = false,
}: EmojiPreviewProps) {
  const t = useT();
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center gap-4 lg:gap-8"
        aria-busy="true"
      >
        <div className="flex size-24 items-center justify-center lg:size-32">
          <Skeleton
            className="size-24 lg:size-32"
            aria-label={`${t("Loading")} ${label}`}
          />
        </div>
        <span className="text-center text-sm">{label}</span>
      </div>
    );
  }

  return (
    <div className="group flex flex-col items-center gap-4 focus:outline-none lg:gap-8">
      <div
        role="img"
        aria-label={label}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is generated from bundled emoji paths and validated palette colors.
        dangerouslySetInnerHTML={{ __html: svg }}
        className="size-24 lg:size-32 [&>svg]:h-full [&>svg]:w-full"
      />
      <span className="text-center text-sm">{label}</span>
    </div>
  );
}
