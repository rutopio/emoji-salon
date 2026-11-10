/**
 * @fileoverview Shared download dialog component for saving emoji images.
 * Provides options to download as SVG, PNG, JPG, or copy to clipboard.
 * Used by both the Create page and Showcase page.
 */

import {
  CheckCircleIcon,
  ClipboardIcon,
  DownloadSimpleIcon,
  FileSvgIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { useT } from "@/lib/translations";

/**
 * Props for the DownloadDialog component.
 */
interface DownloadDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Inline SVG HTML string used for the preview image. */
  svgHTML: string;
  /** Accessible label for the emoji preview. */
  emojiLabel: string;
  /** Called when user selects SVG download. */
  onDownloadSVG: () => void;
  /** Called when user selects PNG download. */
  onDownloadPNG: () => void;
  /** Called when user selects JPG download. */
  onDownloadJPG: () => void;
  /** Called when user selects copy to clipboard. */
  onCopy: () => void;
}

/**
 * Shared download dialog for saving emoji as SVG, PNG, JPG, or clipboard copy.
 *
 * @param props - Component props.
 * @returns Download dialog component.
 */
export default function DownloadDialog({
  open,
  onOpenChange,
  svgHTML,
  emojiLabel,
  onDownloadSVG,
  onDownloadPNG,
  onDownloadJPG,
  onCopy,
}: DownloadDialogProps) {
  const t = useT();
  const handleAndClose = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Save Image")}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center py-2">
          <div
            role="img"
            aria-label={emojiLabel}
            dangerouslySetInnerHTML={{ __html: svgHTML }}
            className="size-32 [&>svg]:size-full"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="h-auto flex-col gap-1.5 py-3"
            onClick={() => handleAndClose(onDownloadSVG)}
          >
            <FileSvgIcon className="size-5" aria-hidden="true" />
            <span className="text-base">SVG</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-1.5 py-3"
            onClick={() => handleAndClose(onDownloadPNG)}
          >
            <DownloadSimpleIcon className="size-5" aria-hidden="true" />
            <span className="text-base">PNG</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-1.5 py-3"
            onClick={() => handleAndClose(onDownloadJPG)}
          >
            <DownloadSimpleIcon className="size-5" aria-hidden="true" />
            <span className="text-base">JPG</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-1.5 py-3"
            onClick={() => handleAndClose(onCopy)}
          >
            <ClipboardIcon className="size-5" aria-hidden="true" />
            <span className="text-base">{t("Copy")}</span>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-center text-muted-foreground text-sm">
          <CheckCircleIcon className="size-4" aria-hidden="true" />
          <p>
            <a
              href={`${GITHUB_REPO_URL}#copyright`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              {t("Free for personal and commercial use")}
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
