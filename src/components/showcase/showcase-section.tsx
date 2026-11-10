/**
 * @fileoverview Showcase section component for displaying emoji variants.
 * Displays an emoji card with original and customized variants, supporting
 * both single and multiple variant displays.
 *
 * Download behaviour:
 *   - Mobile (canShare support): opens the native share sheet via Web Share API
 *     so the user can save the image directly from the OS share menu.
 *   - Desktop: opens a DownloadDialog with SVG / PNG / JPG / Copy options.
 *
 * Share behaviour: opens a ShareDialog (same as the Create page).
 */

import {
  ArrowDownIcon,
  ArrowRightIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import DownloadDialog from "@/components/shared/download-dialog";
import EmojiPreview from "@/components/showcase/emoji-preview";
import ShowcaseShareModal from "@/components/showcase/showcase-share-modal";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useEmojiSVG, useVariantSVG } from "@/hooks/use-emoji-svg";
import {
  CANVAS_BASE_SIZE,
  CANVAS_IMAGE_PADDING,
  CANVAS_SCALE_FACTOR,
} from "@/lib/constants";
import { triggerDownload, unicodeToEmoji } from "@/lib/emoji-utils";
import { downloadSVG } from "@/lib/share-utils";

/**
 * Variant data structure for emoji customization.
 */
interface Variant {
  /** Color palette string identifier. */
  palette: string;
  /** Display name for the variant. */
  name: string;
}

/**
 * Props for the ShowcaseSection component.
 */
interface ShowcaseSectionProps {
  /** Unicode emoji identifier. */
  emoji: string;
  /** Array of variant configurations. */
  variants: Variant[];
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Props for the VariantPreview component.
 */
interface VariantPreviewProps {
  /** Unicode emoji identifier. */
  emoji: string;
  /** Variant configuration. */
  variant: Variant;
}

/**
 * Preview component for a single emoji variant.
 * Loads and displays the SVG for a specific emoji variant.
 *
 * @param props - Component props.
 * @returns Emoji preview component for the variant.
 */
function VariantPreview({ emoji, variant }: VariantPreviewProps) {
  const { svg, isLoading } = useVariantSVG(emoji, variant.palette);

  return <EmojiPreview svg={svg} label={variant.name} isLoading={isLoading} />;
}

/**
 * Showcase section component for displaying emoji with variants.
 * Shows original emoji alongside customized variants with download and share options.
 *
 * @param props - Component props.
 * @returns Showcase section card component.
 */
export default function ShowcaseSection({
  emoji,
  variants,
  className = "",
}: ShowcaseSectionProps) {
  const navigate = useNavigate();
  const firstVariant = variants[0];
  const {
    originalSvg,
    modifiedSvg,
    originalName,
    isLoading,
    customizedPaletteColors,
    originalPaletteColors,
  } = useEmojiSVG(emoji, firstVariant.palette);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  /**
   * Navigates to the main page with the specified emoji and palette.
   *
   * @param palette - Optional palette identifier to pre-select.
   */
  const handleNavigate = (palette?: string) => {
    navigate({
      to: "/",
      search: {
        emoji: emoji,
        palette: palette || undefined,
      },
    });
  };

  /**
   * Generates a PNG (or JPG) image from the modified SVG.
   * Uses a hidden canvas to render the SVG and convert it to a data URL.
   *
   * @param callback - Function called with the generated image data URL.
   * @param format - Output image format ("png" or "jpg"). Defaults to "png".
   */
  const generateImage = useCallback(
    (callback: (dataUrl: string) => void, format: "png" | "jpg" = "png") => {
      const canvas = canvasRef.current;
      if (!canvas || !modifiedSvg) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imagePadding = CANVAS_IMAGE_PADDING;
      const scaleFactor = CANVAS_SCALE_FACTOR;
      const baseSize = CANVAS_BASE_SIZE;

      canvas.width = baseSize * scaleFactor + imagePadding;
      canvas.height = baseSize * scaleFactor + imagePadding;
      ctx.scale(scaleFactor, scaleFactor);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (format === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(
          img,
          imagePadding / scaleFactor / 2,
          imagePadding / scaleFactor / 2,
          baseSize,
          baseSize
        );
        const mime = format === "jpg" ? "image/jpeg" : "image/png";
        callback(canvas.toDataURL(mime));
      };

      const svgBlob = new Blob([modifiedSvg], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    },
    [modifiedSvg]
  );

  /**
   * Handles the download button press.
   *
   * On mobile (viewport < 768 px) with Web Share API support, triggers the OS
   * native share sheet with the PNG attached so the user can save the image.
   * Falls back to the DownloadDialog if the share is cancelled or fails.
   *
   * On desktop, opens the DownloadDialog directly (SVG / PNG / JPG / Copy).
   */
  const handleDownload = useCallback(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile && typeof navigator.canShare === "function") {
      generateImage(async (dataUrl) => {
        const filename = `${emoji}-EmojiSalon.png`;
        const blob = await (await fetch(dataUrl)).blob();
        const files = [
          new File([blob], filename, {
            type: "image/png",
            lastModified: Date.now(),
          }),
        ];
        if (navigator.canShare({ files })) {
          try {
            await navigator.share({ files });
            return; // share succeeded — do not open dialog
          } catch {
            // User cancelled or share failed; fall through to dialog.
          }
        }
        setDownloadOpen(true);
      });
    } else {
      setDownloadOpen(true);
    }
  }, [emoji, generateImage]);

  /**
   * Downloads the modified SVG directly.
   */
  const handleDownloadSVG = useCallback(() => {
    const emojiChar = unicodeToEmoji(emoji) || emoji;
    downloadSVG(modifiedSvg, emojiChar);
  }, [emoji, modifiedSvg]);

  /**
   * Renders the emoji to canvas and triggers a PNG download.
   */
  const handleDownloadPNG = useCallback(() => {
    generateImage((dataUrl) => {
      const filename = `${emoji}-EmojiSalon.png`;
      triggerDownload(dataUrl, filename);
      toast.success("Image downloading...", { description: filename });
    }, "png");
  }, [emoji, generateImage]);

  /**
   * Renders the emoji to canvas (white background) and triggers a JPG download.
   */
  const handleDownloadJPG = useCallback(() => {
    generateImage((dataUrl) => {
      const filename = `${emoji}-EmojiSalon.jpg`;
      triggerDownload(dataUrl, filename);
      toast.success("Image downloading...", { description: filename });
    }, "jpg");
  }, [emoji, generateImage]);

  /**
   * Copies the emoji image to the clipboard.
   */
  const handleCopy = useCallback(() => {
    generateImage((dataUrl) => {
      fetch(dataUrl)
        .then((r) => r.blob())
        .then((blob) => {
          navigator.clipboard
            .write([new ClipboardItem({ "image/png": blob })])
            .then(() => toast.success("Image copied to clipboard."))
            .catch(() => toast.error("Failed to copy image."));
        });
    }, "png");
  }, [generateImage]);

  /**
   * Handles sharing the emoji by opening the share modal.
   */
  const handleShare = useCallback(() => {
    setShareModalOpen(true);
  }, []);

  const unicodeDisplay = `U+${emoji.replace("u", "").toUpperCase()}`;
  const hasMultipleVariants = variants.length > 1;
  const emojiChar = unicodeToEmoji(emoji) || "";

  return (
    <div className={`rounded-lg border bg-card p-4 lg:p-6 ${className}`}>
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-col gap-4 lg:gap-8">
        {/* Unicode label and action buttons */}
        <div className="relative flex w-full items-center justify-start lg:justify-center">
          <span className="font-mono text-base tabular-nums">
            {unicodeDisplay}
          </span>
          <ButtonGroup
            aria-label="Emoji actions"
            className="absolute -top-1 right-0"
          >
            <Button
              aria-label="Edit emoji"
              variant="outline"
              size="icon"
              onClick={() => handleNavigate(firstVariant.palette)}
            >
              <PencilSimpleIcon aria-hidden="true" />
            </Button>
            <Button
              aria-label="Download image"
              variant="outline"
              size="icon"
              onClick={handleDownload}
            >
              <DownloadSimpleIcon aria-hidden="true" />
            </Button>
            <Button
              aria-label="Share emoji"
              variant="outline"
              size="icon"
              onClick={handleShare}
            >
              <ShareNetworkIcon aria-hidden="true" />
            </Button>
          </ButtonGroup>
        </div>

        {/* Emoji previews */}
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:gap-6">
          {/* Original emoji */}
          <EmojiPreview
            svg={originalSvg}
            label={originalName}
            isLoading={isLoading}
          />

          {/* Arrow indicator */}
          <ArrowRightIcon
            size={20}
            weight="bold"
            aria-hidden="true"
            className="hidden text-muted-foreground text-sm lg:block"
          />
          <ArrowDownIcon
            size={20}
            weight="bold"
            aria-hidden="true"
            className="block text-muted-foreground text-sm lg:hidden"
          />

          {/* Variant previews */}
          <div
            className={
              hasMultipleVariants ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : ""
            }
          >
            {hasMultipleVariants ? (
              variants.map((variant) => (
                <VariantPreview
                  key={variant.palette}
                  emoji={emoji}
                  variant={variant}
                />
              ))
            ) : (
              <EmojiPreview
                svg={modifiedSvg}
                label={firstVariant.name}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Download dialog */}
        <DownloadDialog
          open={downloadOpen}
          onOpenChange={setDownloadOpen}
          svgHTML={modifiedSvg}
          emojiLabel={`Customized ${emojiChar} emoji`}
          onDownloadSVG={handleDownloadSVG}
          onDownloadPNG={handleDownloadPNG}
          onDownloadJPG={handleDownloadJPG}
          onCopy={handleCopy}
        />

        {/* Share modal */}
        <ShowcaseShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          emoji={emojiChar}
          palette={firstVariant.palette}
          svgHTML={modifiedSvg}
          emojiLabel={`Customized ${emojiChar} emoji`}
          customizedPaletteColors={customizedPaletteColors}
          originalPaletteColors={originalPaletteColors}
        />
      </div>
    </div>
  );
}
