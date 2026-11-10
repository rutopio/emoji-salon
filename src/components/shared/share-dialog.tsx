/**
 * @fileoverview Shared share dialog component for sharing customized emojis.
 * Provides social sharing buttons (X, Facebook, Threads, Copy Link, Submit Showcase, CSS),
 * where the CSS button opens a secondary dialog showing HTML/CSS code snippets.
 * Used by both the Create page and Showcase page.
 */

import {
  ClipboardIcon,
  CodeIcon,
  FacebookLogoIcon,
  GithubLogoIcon,
  LinkIcon,
  ThreadsLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GITHUB_ISSUE_BASE_URL } from "@/lib/constants";
import {
  copyCSSCode,
  copyHTMLCode,
  copyLinkToClipboard,
  fetchCpalMap,
  generateCSSCode,
  shareToFacebook,
  shareToThreads,
  shareToTwitter,
} from "@/lib/share-utils";
import { useT } from "@/lib/translations";

const BUTTON_CLASS =
  "h-auto flex-col gap-1.5 py-3 [&_svg:not([class*='size-'])]:size-6";

/**
 * Props for the ShareDialog component.
 */
interface ShareDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
  /** URL to share on social media and copy link. */
  shareUrl: string;
  /** Inline SVG HTML string used for the preview image above buttons. */
  svgHTML?: string;
  /** Accessible label for the emoji preview. */
  emojiLabel?: string;
  /** Emoji character — used for HTML/CSS code section. */
  emoji?: string;
  /** Customized palette colors — required for CSS code generation. */
  customizedPaletteColors?: string[];
  /** Original palette colors — required for CSS code generation. */
  originalPaletteColors?: string[];
  /** Whether to show the "Submit to Showcase" button. Defaults to true. */
  showSubmitShowcase?: boolean;
}

/**
 * Shared share dialog with social media buttons, copy link, submit to showcase,
 * and a CSS button that opens a secondary code dialog.
 *
 * @param props - Component props.
 * @returns Share dialog component.
 */
export default function ShareDialog({
  open,
  onOpenChange,
  shareUrl,
  svgHTML,
  emojiLabel,
  emoji,
  customizedPaletteColors,
  originalPaletteColors,
  showSubmitShowcase = true,
}: ShareDialogProps) {
  const t = useT();
  const [cssDialogOpen, setCssDialogOpen] = useState(false);
  const hasCodeData = emoji && customizedPaletteColors && originalPaletteColors;
  const { data: cpalMap = null } = useQuery({
    queryKey: ["cpal-map"],
    queryFn: fetchCpalMap,
    enabled: open && Boolean(hasCodeData),
    staleTime: Number.POSITIVE_INFINITY,
  });

  const cssCode = hasCodeData
    ? generateCSSCode(customizedPaletteColors, originalPaletteColors, cpalMap)
    : "";

  const handleCopyHTMLCode = () => emoji && copyHTMLCode(emoji);
  const handleCopyCSSCode = () => copyCSSCode(cssCode);

  const gridClass = hasCodeData
    ? "grid-cols-3 sm:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-4";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Share your emoji")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {svgHTML && (
              <div className="flex items-center justify-center py-2">
                <div
                  role="img"
                  aria-label={emojiLabel}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: svgHTML is internally generated from generateSVGData(), not user input
                  dangerouslySetInnerHTML={{ __html: svgHTML }}
                  className="size-32 [&>svg]:size-full"
                />
              </div>
            )}

            <div className={`grid gap-2 ${gridClass}`}>
              <Button
                aria-label={t("Share to X (Twitter)")}
                variant="outline"
                className={BUTTON_CLASS}
                onClick={() => shareToTwitter(shareUrl)}
              >
                <XLogoIcon aria-hidden="true" />
                <span className="text-base">X</span>
              </Button>

              <Button
                aria-label={t("Share to Facebook")}
                variant="outline"
                className={BUTTON_CLASS}
                onClick={() => shareToFacebook(shareUrl)}
              >
                <FacebookLogoIcon aria-hidden="true" />
                <span className="text-base">Facebook</span>
              </Button>

              <Button
                aria-label={t("Share to Threads")}
                variant="outline"
                className={BUTTON_CLASS}
                onClick={() => shareToThreads(shareUrl)}
              >
                <ThreadsLogoIcon aria-hidden="true" />
                <span className="text-base">Threads</span>
              </Button>

              <Button
                aria-label={t("Copy link to clipboard")}
                variant="outline"
                className={BUTTON_CLASS}
                onClick={() => copyLinkToClipboard(shareUrl)}
              >
                <LinkIcon aria-hidden="true" />
                <span className="text-base">{t("Copy Link")}</span>
              </Button>

              {hasCodeData && (
                <Button
                  aria-label={t("View HTML/CSS code")}
                  variant="outline"
                  className={BUTTON_CLASS}
                  onClick={() => setCssDialogOpen(true)}
                >
                  <CodeIcon aria-hidden="true" />
                  <span className="text-base">CSS</span>
                </Button>
              )}
            </div>

            {showSubmitShowcase && (
              <Button
                aria-label={t("Submit to showcase")}
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={
                  <a
                    href={GITHUB_ISSUE_BASE_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <GithubLogoIcon aria-hidden="true" />
                    Submit to showcase
                  </a>
                }
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {hasCodeData && (
        <Dialog open={cssDialogOpen} onOpenChange={setCssDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("HTML / CSS Code")}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm">HTML</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyHTMLCode}
                  className="ml-auto"
                >
                  <ClipboardIcon aria-hidden="true" />
                  <span className="text-base">{t("Copy HTML")}</span>
                </Button>
              </div>
              <pre className="overflow-x-auto rounded bg-accent px-4 py-4 text-xs">
                <code className="font-mono">{`<span class="mod-emoji"> ${emoji} </span>`}</code>
              </pre>

              <div className="flex items-center gap-2">
                <div className="font-medium text-sm">CSS</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCSSCode}
                  className="ml-auto"
                >
                  <ClipboardIcon aria-hidden="true" />
                  <span className="text-base">{t("Copy CSS")}</span>
                </Button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-accent px-4 py-4 text-xs">
                <code className="font-mono">{cssCode}</code>
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
