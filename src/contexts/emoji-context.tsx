/**
 * @fileoverview Emoji context provider for sharing emoji state across components.
 * Provides centralized state management for emoji selection, color customization,
 * SVG generation, and sharing functionality in the EmojiSalon application.
 */

import { useMountEffect } from "@rutopio/ui/use-mount-effect";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { EmojiPathData } from "@/lib/emoji-path-data";
import { emojiQueryOptions } from "@/lib/emoji-query";
import {
  emojiToUnicode,
  getOriginalPaletteData,
  getOverrideStyleString,
  getRandomColor,
  getRandomEmojiWithLabel,
  parsePaletteString,
  triggerDownload,
} from "@/lib/emoji-utils";
import { resolveInitialEmoji } from "@/lib/prepare-emoji-route";
import { canvasToPng, rasterizeSvg } from "@/lib/rasterize-svg";
import { downloadSVG } from "@/lib/share-utils";
import { currentT } from "@/lib/translations";

interface EmojiSnapshot {
  currentEmoji: string;
  currentEmojiLabel: string;
  customizedPaletteColors: string[];
  pathArray: string[];
  paletteArray: string[];
  originalPaletteColors: string[];
  originalPaletteIndex: number[];
}

const EMPTY_EMOJI: EmojiSnapshot = {
  currentEmoji: "",
  currentEmojiLabel: "",
  customizedPaletteColors: [],
  pathArray: [],
  paletteArray: [],
  originalPaletteColors: [],
  originalPaletteIndex: [],
};

function createEmojiSnapshot(
  emoji: string,
  label: string,
  data: EmojiPathData,
  palette?: string
): EmojiSnapshot {
  const { originalPaletteColors, originalPaletteIndex } =
    getOriginalPaletteData(data);
  return {
    currentEmoji: emoji,
    currentEmojiLabel: label,
    pathArray: data.d,
    paletteArray: data.f,
    originalPaletteColors,
    originalPaletteIndex,
    customizedPaletteColors: palette
      ? parsePaletteString(palette, originalPaletteColors, originalPaletteIndex)
      : [...originalPaletteColors],
  };
}

/**
 * Context value interface for emoji state and actions.
 */
interface EmojiContextValue {
  /** Current emoji character. */
  currentEmoji: string;
  /** Display label for current emoji. */
  currentEmojiLabel: string;
  /** Array of customized palette colors. */
  customizedPaletteColors: string[];

  /** Array of SVG path data strings. */
  pathArray: string[];
  /** Array of normalized palette color strings. */
  paletteArray: string[];
  /** Array of original palette colors. */
  originalPaletteColors: string[];
  /** Array of indices mapping to original palette colors. */
  originalPaletteIndex: number[];

  /** Whether the share dialog is open. */
  shareDialogOpen: boolean;
  /** Setter for share dialog open state. */
  setShareDialogOpen: (open: boolean) => void;
  /** Data URL of the generated result image. */
  resultImageSrc: string;

  /** Generated SVG HTML for customized emoji. */
  svgHTML: string;
  /** Generated SVG HTML for reference (original) emoji. */
  referenceSvgHTML: string;

  /** Handles emoji selection from picker. */
  handleEmojiSelect: (emoji: string, label: string) => void;
  /** Handles color change at specific index. */
  handleColorChange: (index: number, color: string) => void;
  /** Handles random emoji selection. */
  handleRandomEmoji: () => void;
  /** Handles random color generation for all palette colors. */
  handleRandomColors: () => void;
  /** Handles resetting palette to original colors. */
  handleReset: () => void;
  /** Handles downloading the emoji image in the given format (defaults to png). */
  handleDownloadImage: (format?: ImageFormat) => void;
  /** Handles copying the emoji image to clipboard. */
  handleCopyImage: () => void;
  /** Handles sharing the emoji. */
  handleShare: () => Promise<void>;
}

/** Supported image download formats. */
type ImageFormat = "png" | "jpg" | "svg";

const EmojiContext = createContext<EmojiContextValue | null>(null);

/**
 * Canvas action types for different operations.
 */
const CANVAS_ACTION = {
  DOWNLOAD: 1,
  COPY: 2,
  SHARE: 3,
  GENERATE_PREVIEW: 4,
} as const;

/**
 * Props for the EmojiProvider component.
 */
interface EmojiProviderProps {
  /** Child components to be wrapped by the provider. */
  children: React.ReactNode;
}

/**
 * Provider component for emoji-related state and actions.
 * Manages emoji selection, color customization, SVG generation, and sharing.
 *
 * @param props - Component props.
 * @returns Emoji context provider component.
 */
export function EmojiProvider({ children }: EmojiProviderProps) {
  const pathname = useLocation({ select: (location) => location.pathname });
  return <EmojiEditor key={pathname}>{children}</EmojiEditor>;
}

function EmojiEditor({ children }: EmojiProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [initialSelection] = useState(() =>
    resolveInitialEmoji(location.search)
  );
  const initialQuery = useQuery(emojiQueryOptions(initialSelection.emoji));
  const initialSnapshot = useMemo(
    () =>
      initialQuery.data
        ? createEmojiSnapshot(
            initialSelection.emoji,
            initialSelection.label,
            initialQuery.data,
            initialSelection.palette
          )
        : EMPTY_EMOJI,
    [initialSelection, initialQuery.data]
  );
  const [editedSnapshot, setEditedSnapshot] = useState<EmojiSnapshot | null>(
    null
  );
  const snapshot = editedSnapshot ?? initialSnapshot;
  const {
    currentEmoji,
    currentEmojiLabel,
    customizedPaletteColors,
    pathArray,
    paletteArray,
    originalPaletteColors,
    originalPaletteIndex,
  } = snapshot;

  // Dialog and UI state
  const [shareDialogOpen, setShareDialogOpenState] = useState(false);
  const [resultImageSrc, setResultImageSrc] = useState<string>("");

  // Refs
  const previewIdRef = useRef(0);
  const setShareDialogOpen = useCallback((open: boolean) => {
    if (!open) previewIdRef.current++;
    setShareDialogOpenState(open);
  }, []);
  const urlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const loadIdRef = useRef(0);
  const paletteColorsRef = useRef<string[] | null>(null);
  const applyPaletteColors = useCallback(
    (colors: string[]) => {
      paletteColorsRef.current = colors;
      setEditedSnapshot((previous) => ({
        ...(previous ?? initialSnapshot),
        customizedPaletteColors: colors,
      }));
    },
    [initialSnapshot]
  );
  const cancelPendingURL = useCallback(() => {
    if (urlUpdateTimeoutRef.current !== null) {
      clearTimeout(urlUpdateTimeoutRef.current);
      urlUpdateTimeoutRef.current = null;
    }
  }, []);

  useMountEffect(() => () => {
    cancelPendingURL();
    loadIdRef.current++;
    previewIdRef.current++;
  });

  /**
   * Updates the URL and localStorage with current emoji and palette.
   * Only updates if currently on the home page route.
   *
   * @param emojiUnicode - Unicode identifier for the emoji.
   * @param paletteCode - Optional palette override string.
   */
  const updateURL = useCallback(
    (emojiUnicode: string, paletteCode?: string) => {
      // Only update URL if we're on the home page
      if (
        location.pathname === "/" ||
        location.pathname === "/zh_tw" ||
        location.pathname === "/ja" ||
        location.pathname === "/zh_tw/" ||
        location.pathname === "/ja/"
      ) {
        navigate({
          to: location.pathname.startsWith("/zh_tw")
            ? "/zh_tw"
            : location.pathname.startsWith("/ja")
              ? "/ja"
              : "/",
          search: {
            emoji: emojiUnicode,
            palette: paletteCode || undefined,
          },
          replace: true,
        });

        try {
          localStorage.setItem("emojisalon:emoji", emojiUnicode);
          if (paletteCode) {
            localStorage.setItem("emojisalon:palette", paletteCode);
          } else {
            localStorage.removeItem("emojisalon:palette");
          }
        } catch {
          // The editor and share URL still work when storage is unavailable.
        }
      }
    },
    [navigate, location.pathname]
  );

  const updateEmoji = useCallback(
    async (emoji: string, label: string) => {
      cancelPendingURL();
      const loadId = ++loadIdRef.current;
      try {
        const data = await queryClient.fetchQuery(emojiQueryOptions(emoji));
        if (loadId !== loadIdRef.current) return;
        cancelPendingURL();
        const next = createEmojiSnapshot(emoji, label, data);
        paletteColorsRef.current = next.customizedPaletteColors;
        setEditedSnapshot(next);
        updateURL(emojiToUnicode(emoji));
      } catch {
        if (loadId === loadIdRef.current)
          toast.error(currentT("Could not load this emoji. Try another one."));
      }
    },
    [queryClient, updateURL, cancelPendingURL]
  );

  /**
   * Handles emoji selection from the emoji picker.
   *
   * @param emoji - The selected emoji character.
   * @param label - The display label for the emoji.
   */
  const handleEmojiSelect = useCallback(
    (emoji: string, label: string) => {
      void updateEmoji(emoji, label);
    },
    [updateEmoji]
  );

  /**
   * Handles color change at a specific palette index.
   * Updates the customized palette colors and debounces URL updates to avoid
   * excessive updates during color picker drag interactions.
   *
   * @param index - The index of the color to change.
   * @param color - The new color value (hex string).
   */
  const handleColorChange = useCallback(
    (index: number, color: string) => {
      const colors = paletteColorsRef.current ?? customizedPaletteColors;
      if (index < 0 || index >= colors.length) return;
      const newColors = [...colors];
      newColors[index] = color;
      applyPaletteColors(newColors);
      cancelPendingURL();
      urlUpdateTimeoutRef.current = setTimeout(() => {
        urlUpdateTimeoutRef.current = null;
        const overrides = getOverrideStyleString(
          newColors,
          originalPaletteColors,
          originalPaletteIndex
        );
        updateURL(emojiToUnicode(currentEmoji), overrides);
      }, 500);
    },
    [
      currentEmoji,
      customizedPaletteColors,
      originalPaletteColors,
      originalPaletteIndex,
      updateURL,
      applyPaletteColors,
      cancelPendingURL,
    ]
  );

  /**
   * Handles random emoji selection.
   * Selects a random emoji and resets the palette to original colors.
   */
  const handleRandomEmoji = useCallback(() => {
    const { emoji, label } = getRandomEmojiWithLabel();
    void updateEmoji(emoji, label);
  }, [updateEmoji]);

  /**
   * Handles random color generation for all palette colors.
   * Generates random colors for each position in the palette and updates the URL.
   */
  const handleRandomColors = useCallback(() => {
    if (!currentEmoji) return;
    cancelPendingURL();
    const newColors = (paletteColorsRef.current ?? customizedPaletteColors).map(
      () => getRandomColor()
    );
    applyPaletteColors(newColors);

    const overrideColors = getOverrideStyleString(
      newColors,
      originalPaletteColors,
      originalPaletteIndex
    );
    updateURL(emojiToUnicode(currentEmoji), overrideColors);
  }, [
    cancelPendingURL,
    applyPaletteColors,
    customizedPaletteColors,
    currentEmoji,
    originalPaletteColors,
    originalPaletteIndex,
    updateURL,
  ]);

  /**
   * Handles resetting palette colors to original values.
   * Reloads the current emoji with original palette colors.
   */
  const handleReset = useCallback(() => {
    if (!currentEmoji) return;
    cancelPendingURL();
    loadIdRef.current++;
    applyPaletteColors([...originalPaletteColors]);
    updateURL(emojiToUnicode(currentEmoji));
    toast.success(currentT("Colors reset to original."));
  }, [
    currentEmoji,
    originalPaletteColors,
    updateURL,
    applyPaletteColors,
    cancelPendingURL,
  ]);

  /**
   * Generates SVG HTML for the customized emoji.
   * Applies customized colors to the emoji paths.
   *
   * @returns SVG HTML string for customized emoji.
   */
  const generateSVGData = useCallback(() => {
    if (pathArray.length === 0 || paletteArray.length === 0) return "";

    const svgPaths = pathArray.map((d, index) => {
      const colorIndex = originalPaletteColors.indexOf(
        paletteArray[index] ?? "none"
      );
      const fillColor =
        colorIndex !== -1
          ? customizedPaletteColors[colorIndex] || paletteArray[index]
          : paletteArray[index];
      return `<path fill="${fillColor}" d="${d}" />`;
    });

    return `<svg id="customized-emoji-svg-data" xmlns="http://www.w3.org/2000/svg" width="16em" height="16em" viewBox="0 0 36 36"><g transform="translate(0,0) scale(1,1)">${svgPaths.join("\n")}</g></svg>`;
  }, [pathArray, paletteArray, customizedPaletteColors, originalPaletteColors]);

  /**
   * Generates SVG HTML for the reference (original) emoji.
   * Uses original palette colors without customization.
   *
   * @returns SVG HTML string for reference emoji.
   */
  const generateReferenceSVG = useCallback(() => {
    if (pathArray.length === 0 || paletteArray.length === 0) return "";

    const svgPaths = pathArray.map((d, index) => {
      return `<path fill="${paletteArray[index]}" d="${d}" />`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="16em" height="16em" viewBox="0 0 36 36"><g transform="translate(0,0) scale(1,1)">${svgPaths.join("\n")}</g></svg>`;
  }, [pathArray, paletteArray]);

  /**
   * Updates the canvas with SVG data and performs the specified action.
   * Renders the SVG to canvas and executes download, copy, share, or preview generation.
   *
   * @param action - Action type: 1=download, 2=copy, 3=share, 4=generate preview.
   */
  const updateCanvas = useCallback(
    async (action: number, format: "png" | "jpg" = "png") => {
      const svgData = generateSVGData();
      if (!svgData) return false;
      const previewId =
        action === CANVAS_ACTION.GENERATE_PREVIEW ? ++previewIdRef.current : 0;
      const loadId = loadIdRef.current;
      const colors = paletteColorsRef.current;
      try {
        const canvas = await rasterizeSvg(svgData, format);
        if (action === CANVAS_ACTION.DOWNLOAD) {
          triggerDownload(
            canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png"),
            `${emojiToUnicode(currentEmoji)}-EmojiSalon.${format}`
          );
        } else if (
          action === CANVAS_ACTION.COPY ||
          action === CANVAS_ACTION.SHARE
        ) {
          const blob = await canvasToPng(canvas);
          const files = [
            new File([blob], `${currentEmoji}.png`, { type: "image/png" }),
          ];
          if (
            action === CANVAS_ACTION.SHARE &&
            navigator.canShare?.({ files })
          ) {
            await navigator.share({ files });
            toast.success(currentT("Image shared."));
          } else {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            toast.success(currentT("Image copied to clipboard."));
          }
        } else if (action === CANVAS_ACTION.GENERATE_PREVIEW) {
          if (
            previewId !== previewIdRef.current ||
            loadId !== loadIdRef.current ||
            colors !== paletteColorsRef.current
          )
            return false;
          setResultImageSrc(canvas.toDataURL("image/png"));
        }
        return true;
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          toast.error(
            currentT(
              action === CANVAS_ACTION.COPY
                ? "Failed to copy image."
                : action === CANVAS_ACTION.SHARE
                  ? "Failed to share image."
                  : "Could not generate this image."
            )
          );
        }
        return false;
      }
    },
    [generateSVGData, currentEmoji]
  );

  /**
   * Handles downloading the emoji image in the given format.
   * SVG is written directly from the markup; png/jpg are rendered via canvas.
   *
   * @param format - Output format: "png" (default), "jpg", or "svg".
   */
  const handleDownloadImage = useCallback(
    async (format: ImageFormat = "png") => {
      if (format === "svg") {
        downloadSVG(generateSVGData(), currentEmoji);
        return;
      }
      if (!(await updateCanvas(CANVAS_ACTION.DOWNLOAD, format))) return;
      toast.success(currentT("Downloading image..."), {
        description: `${emojiToUnicode(currentEmoji)}-EmojiSalon.${format}`,
      });
    },
    [updateCanvas, generateSVGData, currentEmoji]
  );

  /**
   * Handles copying the emoji image to clipboard.
   * Uses Web Share API if available, otherwise falls back to clipboard API.
   */
  const handleCopyImage = useCallback(() => {
    // The success/error toast is fired by updateCanvas once the async
    // clipboard write / share settles, so we don't toast optimistically here.
    if (typeof navigator.canShare === "function") {
      updateCanvas(CANVAS_ACTION.SHARE);
    } else {
      updateCanvas(CANVAS_ACTION.COPY);
    }
  }, [updateCanvas]);

  /**
   * Handles sharing the emoji.
   * On mobile, uses native share dialog. On desktop, opens share dialog.
   */
  const handleShare = useCallback(async () => {
    if (navigator.share && window.innerWidth < 768) {
      const shareData = {
        title: currentT("Share with friends"),
        text: "#EmojiSalon",
        url: window.location.href,
      };
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          toast.error(currentT("Could not share this page."));
        }
      }
    } else if (await updateCanvas(CANVAS_ACTION.GENERATE_PREVIEW)) {
      setShareDialogOpen(true);
    }
  }, [updateCanvas, setShareDialogOpen]);

  // Computed SVG HTML
  const svgHTML = generateSVGData();
  const referenceSvgHTML = generateReferenceSVG();

  const value: EmojiContextValue = {
    currentEmoji,
    currentEmojiLabel,
    customizedPaletteColors,
    pathArray,
    paletteArray,
    originalPaletteColors,
    originalPaletteIndex,
    shareDialogOpen,
    setShareDialogOpen,
    resultImageSrc,
    svgHTML,
    referenceSvgHTML,
    handleEmojiSelect,
    handleColorChange,
    handleRandomEmoji,
    handleRandomColors,
    handleReset,
    handleDownloadImage,
    handleCopyImage,
    handleShare,
  };

  return (
    <EmojiContext value={value}>
      {initialQuery.isError && !editedSnapshot && (
        <p role="alert">
          {currentT("Could not load this emoji. Try another one.")}
        </p>
      )}
      {children}
    </EmojiContext>
  );
}

/**
 * Hook to access the emoji context.
 * Provides access to all emoji state and actions.
 *
 * @returns Emoji context value with state and actions.
 * @throws Error if used outside of EmojiProvider.
 */
export function useEmoji(): EmojiContextValue {
  const context = use(EmojiContext);
  if (!context) {
    throw new Error("useEmoji must be used within an EmojiProvider");
  }
  return context;
}
