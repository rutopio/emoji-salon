import { toast } from "sonner";

import {
  FACEBOOK_SHARE_BASE_URL,
  THREADS_SHARE_BASE_URL,
  TWITTER_SHARE_BASE_URL,
} from "@/lib/constants";
import { emojiToUnicode, triggerDownload } from "@/lib/emoji-utils";
import { localeForPath, withLocale } from "@/lib/locale";
import { currentT } from "@/lib/translations";

export function generateShareURL(emoji: string, palette: string): string {
  const baseURL = window.location.origin;
  const emojiUnicode = emojiToUnicode(emoji);
  return `${baseURL}${withLocale("/", localeForPath(window.location.pathname))}?emoji=${emojiUnicode}&palette=${palette}`;
}

export function shareToTwitter(url?: string): void {
  const shareUrl = url ?? window.location.href;
  const message = `#EmojiSalon ${shareUrl}`;
  const twitterShareURL = `${TWITTER_SHARE_BASE_URL}?text=${encodeURIComponent(message)}`;
  window.open(twitterShareURL, "_blank");
  toast.success(currentT("Shared to Twitter."));
}

export function shareToFacebook(url?: string): void {
  const shareUrl = url ?? window.location.href;
  const facebookShareURL = `${FACEBOOK_SHARE_BASE_URL}?u=${encodeURIComponent(shareUrl)}`;
  window.open(facebookShareURL, "_blank");
  toast.success(currentT("Shared to Facebook."));
}

export function shareToThreads(url?: string): void {
  const shareUrl = url ?? window.location.href;
  const message = `#EmojiSalon ${shareUrl}`;
  const threadsShareURL = `${THREADS_SHARE_BASE_URL}?text=${encodeURIComponent(message)}`;
  window.open(threadsShareURL, "_blank");
  toast.success(currentT("Shared to Threads."));
}

export function copyLinkToClipboard(url?: string): void {
  const copyUrl = url ?? window.location.href;
  navigator.clipboard.writeText(copyUrl);
  toast.success(currentT("Link copied to clipboard."), {
    description: copyUrl,
  });
}

export function copyHTMLCode(emoji: string): void {
  const htmlCode = `<span class="mod-emoji"> ${emoji} </span>`;
  navigator.clipboard.writeText(htmlCode);
  toast.success(currentT("HTML code copied to clipboard."), {
    description: htmlCode,
  });
}

export function copyCSSCode(cssCode: string): void {
  navigator.clipboard.writeText(cssCode);
  toast.success(currentT("CSS code copied to clipboard."));
}

/** Original fill color to the COLR font's global palette index. */
export type CpalMap = Record<string, number>;

let cpalMapPromise: Promise<CpalMap | null> | null = null;

export function fetchCpalMap(): Promise<CpalMap | null> {
  if (!cpalMapPromise) {
    cpalMapPromise = fetch("/data/cpal-map.json")
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<CpalMap>;
      })
      .catch(() => null);
  }
  return cpalMapPromise;
}

const TWEMOJI_COLR_FONT_URL =
  "https://cdn.jsdelivr.net/npm/@sableclient/twemoji-font@1.0.2/dist/files/twemoji.woff2";

/** CSS overrides use global CPAL indices, not per-emoji SVG palette positions. */
export function generateCSSCode(
  customizedColors: string[],
  originalColors: string[],
  cpalMap?: CpalMap | null
): string {
  const overrides: string[] = [];

  customizedColors.forEach((color, idx) => {
    const originalColor = originalColors[idx];
    if (originalColor && color.toLowerCase() !== originalColor.toLowerCase()) {
      const globalIdx = cpalMap?.[originalColor.toLowerCase()];
      if (globalIdx !== undefined) {
        overrides.push(`${globalIdx} ${color}`);
      }
    }
  });

  const overrideColors = overrides.join(", ");

  return `@font-face { 
    font-family: Twemoji;
    src: url("${TWEMOJI_COLR_FONT_URL}") format("woff2");
}

.mod-emoji {
    font-family: Twemoji;
    font-palette: --mod-palette;
}

@font-palette-values --mod-palette {
    font-family: Twemoji;
    base-palette: 0;${overrideColors ? `\n    override-colors: ${overrideColors};` : ""}
}`;
}

export function downloadSVG(svgData: string, emoji: string): void {
  const svgBlob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);
  const filename = `${emojiToUnicode(emoji)}-EmojiSalon.svg`;
  triggerDownload(url, filename);
  toast.success(currentT("Downloading SVG..."), {
    description: filename,
  });
}
