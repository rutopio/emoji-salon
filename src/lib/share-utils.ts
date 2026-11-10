/**
 * @fileoverview Sharing utility functions for EmojiSalon application.
 * Provides functions for sharing customized emojis via social media,
 * copying links to clipboard, generating CSS code, and downloading files.
 */

import { toast } from "sonner";

import {
  FACEBOOK_SHARE_BASE_URL,
  THREADS_SHARE_BASE_URL,
  TWITTER_SHARE_BASE_URL,
} from "@/lib/constants";
import { emojiToUnicode, triggerDownload } from "@/lib/emoji-utils";
import { localeForPath, withLocale } from "@/lib/locale";
import { currentT } from "@/lib/translations";

/**
 * Generates a shareable URL for a specific emoji/palette combination.
 *
 * @param emoji - The emoji character.
 * @param palette - The palette override string.
 * @returns The shareable URL with emoji and palette parameters.
 *
 * @example
 * generateShareURL("😀", "0-ff0000"); // Returns "https://example.com/?emoji=1f600&palette=0-ff0000"
 */
export function generateShareURL(emoji: string, palette: string): string {
  const baseURL = window.location.origin;
  const emojiUnicode = emojiToUnicode(emoji);
  return `${baseURL}${withLocale("/", localeForPath(window.location.pathname))}?emoji=${emojiUnicode}&palette=${palette}`;
}

/**
 * Shares to Twitter/X.
 * Opens a new browser tab with a pre-filled tweet containing
 * the #EmojiSalon hashtag and the specified URL.
 *
 * @param url - Optional URL to share. Defaults to current page URL.
 *
 * @example
 * shareToTwitter(); // Opens Twitter with "#EmojiSalon https://..."
 * shareToTwitter("https://example.com"); // Opens Twitter with custom URL
 */
export function shareToTwitter(url?: string): void {
  const shareUrl = url ?? window.location.href;
  const message = `#EmojiSalon ${shareUrl}`;
  const twitterShareURL = `${TWITTER_SHARE_BASE_URL}?text=${encodeURIComponent(message)}`;
  window.open(twitterShareURL, "_blank");
  toast.success(currentT("Shared to Twitter."));
}

/**
 * Shares to Facebook.
 * Opens a new browser tab with the Facebook share dialog
 * pre-filled with the specified URL.
 *
 * @param url - Optional URL to share. Defaults to current page URL.
 *
 * @example
 * shareToFacebook(); // Opens Facebook share dialog
 * shareToFacebook("https://example.com"); // Opens Facebook with custom URL
 */
export function shareToFacebook(url?: string): void {
  const shareUrl = url ?? window.location.href;
  const facebookShareURL = `${FACEBOOK_SHARE_BASE_URL}?u=${encodeURIComponent(shareUrl)}`;
  window.open(facebookShareURL, "_blank");
  toast.success(currentT("Shared to Facebook."));
}

/**
 * Shares to Threads.
 * Opens a new browser tab with a pre-filled post containing
 * the #EmojiSalon hashtag and the specified URL.
 *
 * @param url - Optional URL to share. Defaults to current page URL.
 *
 * @example
 * shareToThreads(); // Opens Threads with "#EmojiSalon https://..."
 * shareToThreads("https://example.com"); // Opens Threads with custom URL
 */
export function shareToThreads(url?: string): void {
  const shareUrl = url ?? window.location.href;
  const message = `#EmojiSalon ${shareUrl}`;
  const threadsShareURL = `${THREADS_SHARE_BASE_URL}?text=${encodeURIComponent(message)}`;
  window.open(threadsShareURL, "_blank");
  toast.success(currentT("Shared to Threads."));
}

/**
 * Copies a URL to the clipboard.
 * Uses the modern Clipboard API. Requires a secure context (HTTPS).
 *
 * @param url - Optional URL to copy. Defaults to current page URL.
 *
 * @example
 * copyLinkToClipboard(); // Copies current URL to clipboard
 * copyLinkToClipboard("https://example.com"); // Copies custom URL
 */
export function copyLinkToClipboard(url?: string): void {
  const copyUrl = url ?? window.location.href;
  navigator.clipboard.writeText(copyUrl);
  toast.success(currentT("Link copied to clipboard."), {
    description: copyUrl,
  });
}

/**
 * Copies HTML code for displaying the emoji to the clipboard.
 *
 * @param emoji - The emoji character.
 */
export function copyHTMLCode(emoji: string): void {
  const htmlCode = `<span class="mod-emoji"> ${emoji} </span>`;
  navigator.clipboard.writeText(htmlCode);
  toast.success(currentT("HTML code copied to clipboard."), {
    description: htmlCode,
  });
}

/**
 * Copies CSS code to the clipboard.
 *
 * @param cssCode - The CSS code string to copy.
 */
export function copyCSSCode(cssCode: string): void {
  navigator.clipboard.writeText(cssCode);
  toast.success(currentT("CSS code copied to clipboard."));
}

/**
 * Hex-color (or CSS named color) to CPAL global palette index.
 * Loaded once from `/data/cpal-map.json` and cached.
 */
export type CpalMap = Record<string, number>;

/** Cached CPAL map promise so the fetch happens at most once per session. */
let cpalMapPromise: Promise<CpalMap | null> | null = null;

/**
 * Fetches the CPAL palette-index map (color -> global COLR font index).
 * The result is cached; subsequent calls return the same promise.
 */
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

/**
 * Generates CSS code for using the customized emoji with Twemoji COLR font.
 * The generated CSS includes:
 * - @font-face declaration for the Twemoji font
 * - A .mod-emoji class that applies the font
 * - @font-palette-values with color overrides (if any)
 *
 * When a CPAL map is provided, original colors are resolved to global COLR
 * font palette indices so the generated `override-colors` work correctly
 * with the font's CPAL table.
 *
 * @param customizedColors - Current customized palette colors.
 * @param originalColors - Original palette colors.
 * @param cpalMap - Optional CPAL color-to-index map for global index resolution.
 * @returns Complete CSS code for displaying the customized emoji.
 */
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

/**
 * Downloads the customized emoji as an SVG file.
 * Creates a blob from the SVG data and triggers a download
 * with a filename based on the emoji's unicode identifier.
 *
 * @param svgData - The SVG content as a string.
 * @param emoji - The emoji character (used for filename).
 *
 * @example
 * const svgContent = '<svg xmlns="...">...</svg>';
 * downloadSVG(svgContent, "😀"); // Downloads as "u1f600-EmojiSalon.svg"
 */
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
