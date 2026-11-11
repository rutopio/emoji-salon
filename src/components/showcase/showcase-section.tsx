import {
  ArrowDownIcon,
  ArrowRightIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { Button } from "@rutopio/ui/button";
import { ButtonGroup } from "@rutopio/ui/button-group";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import DownloadDialog from "@/components/feedback/download-dialog";
import EmojiPreview from "@/components/showcase/emoji-preview";
import ShowcaseShareDialog from "@/components/showcase/showcase-share-dialog";
import { useEmojiSVG, useVariantSVG } from "@/hooks/use-emoji-svg";
import { useLocale } from "@/hooks/use-locale";
import { useT } from "@/hooks/use-translation";
import { triggerDownload, unicodeToEmoji } from "@/lib/emoji-utils";
import { withLocale } from "@/lib/locale";
import { rasterizeSvg } from "@/lib/rasterize-svg";
import { downloadSVG } from "@/lib/share-utils";

interface Variant {
  /** Share-URL palette overrides, e.g. 0_ff0000. */
  palette: string;
  name: string;
}

interface ShowcaseSectionProps {
  /** Asset ID, e.g. u1f600. */
  emoji: string;
  variants: Variant[];
  className?: string;
}

interface VariantPreviewProps {
  /** Asset ID, e.g. u1f600. */
  emoji: string;
  variant: Variant;
}

function VariantPreview({ emoji, variant }: VariantPreviewProps) {
  const t = useT();
  const { svg, isLoading } = useVariantSVG(emoji, variant.palette);

  return (
    <EmojiPreview svg={svg} label={t(variant.name)} isLoading={isLoading} />
  );
}

export default function ShowcaseSection({
  emoji,
  variants,
  className = "",
}: ShowcaseSectionProps) {
  const navigate = useNavigate();
  const locale = useLocale();
  const t = useT();
  const firstVariant = variants[0];
  const {
    originalSvg,
    modifiedSvg,
    originalName,
    isLoading,
    customizedPaletteColors,
    originalPaletteColors,
  } = useEmojiSVG(emoji, firstVariant?.palette);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const handleNavigate = (palette?: string) => {
    navigate({
      to: withLocale("/", locale),
      search: {
        emoji: emoji,
        palette: palette || undefined,
      },
    });
  };

  const generateImage = useCallback(
    async (
      callback: (dataUrl: string) => void | Promise<void>,
      format: "png" | "jpg" = "png"
    ) => {
      if (!modifiedSvg) return;
      try {
        const canvas = await rasterizeSvg(modifiedSvg, format);
        await callback(
          canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png")
        );
      } catch {
        toast.error(t("Could not generate this image."));
      }
    },
    [modifiedSvg, t]
  );

  // Native sharing lets mobile users save the image through the OS share sheet.
  const handleDownload = useCallback(() => {
    const isNarrowViewport = window.innerWidth < 768;

    if (isNarrowViewport && typeof navigator.canShare === "function") {
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
            return;
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

  const handleDownloadSVG = useCallback(() => {
    const emojiChar = unicodeToEmoji(emoji) || emoji;
    downloadSVG(modifiedSvg, emojiChar);
  }, [emoji, modifiedSvg]);

  const handleDownloadPNG = useCallback(() => {
    generateImage((dataUrl) => {
      const filename = `${emoji}-EmojiSalon.png`;
      triggerDownload(dataUrl, filename);
      toast.success(t("Downloading image..."), { description: filename });
    }, "png");
  }, [emoji, generateImage, t]);

  const handleDownloadJPG = useCallback(() => {
    generateImage((dataUrl) => {
      const filename = `${emoji}-EmojiSalon.jpg`;
      triggerDownload(dataUrl, filename);
      toast.success(t("Downloading image..."), { description: filename });
    }, "jpg");
  }, [emoji, generateImage, t]);

  const handleCopy = useCallback(() => {
    void generateImage(async (dataUrl) => {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success(t("Image copied to clipboard."));
      } catch {
        toast.error(t("Failed to copy image."));
      }
    }, "png");
  }, [generateImage, t]);

  const handleShare = useCallback(() => {
    setShareDialogOpen(true);
  }, []);

  if (!firstVariant) return null;

  const unicodeDisplay = `U+${emoji.replace("u", "").toUpperCase()}`;
  const hasMultipleVariants = variants.length > 1;
  const emojiChar = unicodeToEmoji(emoji) || "";

  return (
    <div className={`bg-card rounded-lg border p-4 lg:p-6 ${className}`}>
      <div className="flex flex-col gap-4 lg:gap-8">
        <div className="relative flex w-full items-center justify-start lg:justify-center">
          <span className="font-mono text-base tabular-nums">
            {unicodeDisplay}
          </span>
          <ButtonGroup
            aria-label={t("Emoji actions")}
            className="absolute -top-1 right-0"
          >
            <Button
              aria-label={t("Edit emoji")}
              variant="outline"
              size="icon"
              onClick={() => handleNavigate(firstVariant.palette)}
            >
              <PencilSimpleIcon aria-hidden="true" />
            </Button>
            <Button
              aria-label={t("Download image")}
              variant="outline"
              size="icon"
              onClick={handleDownload}
            >
              <DownloadSimpleIcon aria-hidden="true" />
            </Button>
            <Button
              aria-label={t("Share emoji")}
              variant="outline"
              size="icon"
              onClick={handleShare}
            >
              <ShareNetworkIcon aria-hidden="true" />
            </Button>
          </ButtonGroup>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:gap-6">
          <EmojiPreview
            svg={originalSvg}
            label={t(originalName)}
            isLoading={isLoading}
          />

          <ArrowRightIcon
            size={20}
            weight="bold"
            aria-hidden="true"
            className="text-muted-foreground hidden text-sm lg:block"
          />
          <ArrowDownIcon
            size={20}
            weight="bold"
            aria-hidden="true"
            className="text-muted-foreground block text-sm lg:hidden"
          />

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
                label={t(firstVariant.name)}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        <DownloadDialog
          open={downloadOpen}
          onOpenChange={setDownloadOpen}
          svgHTML={modifiedSvg}
          emojiLabel={`${t("Customized emoji")} ${emojiChar}`}
          onDownloadSVG={handleDownloadSVG}
          onDownloadPNG={handleDownloadPNG}
          onDownloadJPG={handleDownloadJPG}
          onCopy={handleCopy}
        />

        <ShowcaseShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          emoji={emojiChar}
          palette={firstVariant.palette}
          svgHTML={modifiedSvg}
          emojiLabel={`${t("Customized emoji")} ${emojiChar}`}
          customizedPaletteColors={customizedPaletteColors}
          originalPaletteColors={originalPaletteColors}
        />
      </div>
    </div>
  );
}
