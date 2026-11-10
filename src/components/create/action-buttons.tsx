/**
 * @fileoverview Action buttons component for emoji customization interface.
 * Provides buttons for emoji selection, color randomization, reset, download,
 * copy, and share functionality. Supports both desktop and mobile layouts.
 */

import {
  ArrowCounterClockwiseIcon,
  DiceFiveIcon,
  DownloadSimpleIcon,
  PaletteIcon,
  ShareNetworkIcon,
  SmileyWinkIcon,
} from "@phosphor-icons/react";
import { Button } from "@rutopio/base-component/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@rutopio/base-component/drawer";
import { useState } from "react";
import { EmojiPicker } from "@/components/create/emoji-picker";
import DownloadDialog from "@/components/shared/download-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmoji } from "@/contexts/emoji-context";
import { useT } from "@/lib/translations";

/**
 * Props for the ActionButtons component.
 */
interface ActionButtonsProps {
  /** Display variant: desktop shows all buttons with labels, mobile shows compact grid layout. */
  variant?: "desktop" | "mobile";
}

/**
 * Action buttons component for emoji customization.
 * Displays buttons for emoji selection, color operations, and sharing.
 *
 * @param props - Component props.
 * @returns Action buttons UI for desktop or mobile layout.
 */
export default function ActionButtons({
  variant = "desktop",
}: ActionButtonsProps) {
  const t = useT();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const {
    svgHTML,
    currentEmoji,
    handleEmojiSelect,
    handleRandomEmoji,
    handleRandomColors,
    handleReset,
    handleDownloadImage,
    handleCopyImage,
    handleShare,
  } = useEmoji();

  /**
   * Handles emoji selection and closes the picker popover.
   *
   * @param emoji - The selected emoji character.
   * @param label - The emoji label/name.
   */
  const handleEmojiSelectAndClose = (emoji: string, label: string) => {
    setEmojiPickerOpen(false);
    handleEmojiSelect(emoji, label);
  };

  if (variant === "mobile") {
    return (
      <div className="flex w-full flex-col gap-4 lg:hidden">
        <div className="grid w-full grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="col-span-3"
            onClick={() => setEmojiPickerOpen(true)}
          >
            <SmileyWinkIcon className="size-5" aria-hidden="true" />
            <span className="ml-1">{t("Select Emoji")}</span>
          </Button>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={t("Random Emoji")}
                  variant="outline"
                  className="col-span-1"
                  onClick={handleRandomEmoji}
                >
                  <DiceFiveIcon className="size-5" aria-hidden="true" />
                </Button>
              }
            />
            <TooltipContent>{t("Random Emoji")}</TooltipContent>
          </Tooltip>
        </div>

        <Drawer open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="cn-font-heading">
                {t("Select Emoji")}
              </DrawerTitle>
              <DrawerDescription className="sr-only">
                {t("Choose an emoji to customize")}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex justify-center overflow-auto p-4 pt-0">
              <EmojiPicker onEmojiSelect={handleEmojiSelectAndClose} />
            </div>
          </DrawerContent>
        </Drawer>

        <div className="grid w-full grid-cols-4 gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={t("Random Colors")}
                  variant="outline"
                  className="w-full"
                  onClick={handleRandomColors}
                >
                  <PaletteIcon className="size-5" aria-hidden="true" />
                </Button>
              }
            />
            <TooltipContent>{t("Random Colors")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={t("Reset Colors")}
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  <ArrowCounterClockwiseIcon
                    className="size-5"
                    aria-hidden="true"
                  />
                </Button>
              }
            />
            <TooltipContent>{t("Reset Colors")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={t("Save Image")}
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyImage}
                >
                  <DownloadSimpleIcon className="size-5" aria-hidden="true" />
                </Button>
              }
            />
            <TooltipContent>{t("Save Image")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={t("Share")}
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <ShareNetworkIcon className="size-5" aria-hidden="true" />
                </Button>
              }
            />
            <TooltipContent>{t("Share")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden gap-4 lg:grid lg:grid-cols-5">
      <Button variant="outline" onClick={handleRandomEmoji}>
        <DiceFiveIcon className="size-5" aria-hidden="true" />
        {t("Random Emoji")}
      </Button>
      <Button variant="outline" onClick={handleRandomColors}>
        <PaletteIcon className="size-5" aria-hidden="true" />
        {t("Random Colors")}
      </Button>
      <Button variant="outline" onClick={handleReset}>
        <ArrowCounterClockwiseIcon className="size-5" aria-hidden="true" />
        {t("Reset Palette")}
      </Button>
      <Button variant="outline" onClick={() => setDownloadOpen(true)}>
        <DownloadSimpleIcon className="size-5" aria-hidden="true" />
        {t("Save Image")}
      </Button>
      <Button variant="outline" onClick={handleShare}>
        <ShareNetworkIcon className="size-5" aria-hidden="true" />
        {t("Share Link")}
      </Button>

      <DownloadDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        svgHTML={svgHTML}
        emojiLabel={`${t("Customized emoji")} ${currentEmoji}`}
        onDownloadSVG={() => handleDownloadImage("svg")}
        onDownloadPNG={() => handleDownloadImage("png")}
        onDownloadJPG={() => handleDownloadImage("jpg")}
        onCopy={handleCopyImage}
      />
    </div>
  );
}
