/**
 * @fileoverview Emoji context provider for sharing emoji state across components.
 * Provides centralized state management for emoji selection, color customization,
 * SVG generation, and sharing functionality in the EmojiSalon application.
 */

import { useMountEffect } from "@rutopio/ui/use-mount-effect";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { createContext, use, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CANVAS_BASE_SIZE,
  CANVAS_IMAGE_PADDING,
  CANVAS_SCALE_FACTOR,
} from "@/lib/constants";
import {
  emojiToUnicode,
  fetchEmojiData,
  getEmojiLabel,
  getOriginalPaletteData,
  getOverrideStyleString,
  getRandomColor,
  getRandomEmojiWithLabel,
  parsePaletteString,
  triggerDownload,
  unicodeToEmoji,
} from "@/lib/emoji-utils";
import { downloadSVG } from "@/lib/share-utils";
import { currentT } from "@/lib/translations";

/**
 * Search parameters for emoji and palette from URL.
 */
interface EmojiSearchParams {
  /** Unicode emoji identifier from URL. */
  emoji?: string;
  /** Palette override string from URL. */
  palette?: string;
}

/**
 * Context value interface for emoji state and actions.
 */
interface EmojiContextValue {
  /** Current emoji character. */
  currentEmoji: string;
  /** Setter for current emoji. */
  setCurrentEmoji: (emoji: string) => void;
  /** Display label for current emoji. */
  currentEmojiLabel: string;
  /** Setter for emoji label. */
  setCurrentEmojiLabel: (label: string) => void;
  /** Array of customized palette colors. */
  customizedPaletteColors: string[];
  /** Setter for customized palette colors. */
  setCustomizedPaletteColors: React.Dispatch<React.SetStateAction<string[]>>;

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

  /** Reference to the hidden canvas element for image generation. */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

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
  const navigate = useNavigate();
  const location = useLocation();

  // Parse search parameters from current location
  const search: EmojiSearchParams = {
    emoji:
      typeof location.search.emoji === "string"
        ? location.search.emoji
        : undefined,
    palette:
      typeof location.search.palette === "string"
        ? location.search.palette
        : undefined,
  };

  // Basic emoji state
  const [currentEmoji, setCurrentEmoji] = useState<string>("");
  const [currentEmojiLabel, setCurrentEmojiLabel] = useState<string>("");
  const [customizedPaletteColors, setCustomizedPaletteColors] = useState<
    string[]
  >([]);

  // SVG data state
  const [pathArray, setPathArray] = useState<string[]>([]);
  const [paletteArray, setPaletteArray] = useState<string[]>([]);
  const [originalPaletteColors, setOriginalPaletteColors] = useState<string[]>(
    []
  );
  const [originalPaletteIndex, setOriginalPaletteIndex] = useState<number[]>(
    []
  );

  // Dialog and UI state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [resultImageSrc, setResultImageSrc] = useState<string>("");

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const urlUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isInitializedRef = useRef(false);
  const loadIdRef = useRef(0);

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

        // Save to localStorage for persistence
        localStorage.setItem("emojisalon:emoji", emojiUnicode);
        if (paletteCode) {
          localStorage.setItem("emojisalon:palette", paletteCode);
        } else {
          localStorage.removeItem("emojisalon:palette");
        }
      }
    },
    [navigate, location.pathname]
  );

  /**
   * Updates the current emoji and loads its data.
   * Fetches emoji data, sets up palette colors, and optionally preserves or applies palette.
   *
   * @param emoji - The emoji character to load.
   * @param keepPalette - Whether to preserve current palette or reset to original.
   * @param paletteFromURL - Optional palette string from URL to apply.
   */
  const updateEmoji = useCallback(
    async (emoji: string, keepPalette: boolean, paletteFromURL?: string) => {
      const loadId = ++loadIdRef.current;
      setCurrentEmoji(emoji);

      const data = await fetchEmojiData(emoji);
      if (loadId !== loadIdRef.current) return;
      if (data) {
        setPathArray(data.d);
        setPaletteArray(data.f);

        const {
          originalPaletteIndex: opIndex,
          originalPaletteColors: opColors,
        } = getOriginalPaletteData(data);
        setOriginalPaletteIndex(opIndex);
        setOriginalPaletteColors(opColors);

        if (!keepPalette) {
          setCustomizedPaletteColors([...opColors]);
          updateURL(emojiToUnicode(emoji));
        } else if (paletteFromURL) {
          const modifiedColors = parsePaletteString(
            paletteFromURL,
            opColors,
            opIndex
          );
          setCustomizedPaletteColors(modifiedColors);
        } else {
          setCustomizedPaletteColors([...opColors]);
        }
      } else {
        // fetchEmojiData already logged the cause; surface it to the user so a
        // broken URL palette or missing asset doesn't just silently do nothing.
        toast.error(currentT("Could not load this emoji. Try another one."));
      }
    },
    [updateURL]
  );

  /**
   * Handles emoji selection from the emoji picker.
   *
   * @param emoji - The selected emoji character.
   * @param label - The display label for the emoji.
   */
  const handleEmojiSelect = useCallback(
    (emoji: string, label: string) => {
      setCurrentEmojiLabel(label);
      updateEmoji(emoji, false);
    },
    [updateEmoji]
  );

  /**
   * Initializes emoji from URL, localStorage, or random selection.
   * Runs when the home page mounts. Tries to load emoji in order:
   * 1. From URL search parameters
   * 2. From localStorage
   * 3. Random emoji if neither available
   */
  useMountEffect(() => {
    const timer = setTimeout(() => {
      let emojiLoaded = false;

      // Try to load from URL search parameters
      if (search.emoji) {
        try {
          const emoji = unicodeToEmoji(search.emoji);
          if (emoji) {
            setCurrentEmojiLabel(getEmojiLabel(emoji));
            updateEmoji(emoji, !!search.palette, search.palette);
            emojiLoaded = true;
          }
        } catch {
          // URL parsing failed, continue to localStorage
        }
      }

      // If URL failed and not yet initialized, try localStorage
      if (!emojiLoaded && !isInitializedRef.current) {
        const storedEmoji = localStorage.getItem("emojisalon:emoji");
        const storedPalette = localStorage.getItem("emojisalon:palette");

        if (storedEmoji) {
          try {
            const emoji = unicodeToEmoji(storedEmoji);
            if (emoji) {
              setCurrentEmojiLabel(getEmojiLabel(emoji));
              updateEmoji(emoji, !!storedPalette, storedPalette || undefined);
              emojiLoaded = true;
            }
          } catch {
            // localStorage parsing failed, continue to random
          }
        }
      }

      // If both URL and localStorage failed and not yet initialized, use random emoji
      if (!emojiLoaded && !isInitializedRef.current) {
        const { emoji: randomEmoji, label } = getRandomEmojiWithLabel();
        setCurrentEmojiLabel(label);
        updateEmoji(randomEmoji, false);
      }

      isInitializedRef.current = true;
    }, 0);

    return () => {
      clearTimeout(timer);
      loadIdRef.current++;
    };
  });

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
      setCustomizedPaletteColors((prev) => {
        const newColors = [...prev];
        newColors[index] = color;

        // Debounce URL update to avoid excessive updates during drag
        if (urlUpdateTimeoutRef.current) {
          clearTimeout(urlUpdateTimeoutRef.current);
        }
        urlUpdateTimeoutRef.current = setTimeout(() => {
          const overrideColors = getOverrideStyleString(
            newColors,
            originalPaletteColors,
            originalPaletteIndex
          );
          if (overrideColors) {
            updateURL(emojiToUnicode(currentEmoji), overrideColors);
          } else {
            updateURL(emojiToUnicode(currentEmoji));
          }
        }, 500);

        return newColors;
      });
    },
    [currentEmoji, originalPaletteColors, originalPaletteIndex, updateURL]
  );

  /**
   * Handles random emoji selection.
   * Selects a random emoji and resets the palette to original colors.
   */
  const handleRandomEmoji = useCallback(() => {
    const { emoji, label } = getRandomEmojiWithLabel();
    setCurrentEmojiLabel(label);
    updateEmoji(emoji, false);
  }, [updateEmoji]);

  /**
   * Handles random color generation for all palette colors.
   * Generates random colors for each position in the palette and updates the URL.
   */
  const handleRandomColors = useCallback(() => {
    const newColors = customizedPaletteColors.map(() => getRandomColor());
    setCustomizedPaletteColors(newColors);

    const overrideColors = getOverrideStyleString(
      newColors,
      originalPaletteColors,
      originalPaletteIndex
    );
    if (overrideColors) {
      updateURL(emojiToUnicode(currentEmoji), overrideColors);
    }
  }, [
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
    updateEmoji(currentEmoji, false);
    toast.success(currentT("Colors reset to original."));
  }, [currentEmoji, updateEmoji]);

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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const svgData = generateSVGData();
      if (!svgData) return;

      const imagePadding = CANVAS_IMAGE_PADDING;
      const scaleFactor = CANVAS_SCALE_FACTOR;
      const baseSize = CANVAS_BASE_SIZE;

      canvas.width = baseSize * scaleFactor + imagePadding;
      canvas.height = baseSize * scaleFactor + imagePadding;
      ctx.scale(scaleFactor, scaleFactor);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // JPG has no alpha channel; fill a white background so transparent
      // areas don't render as black.
      const isJpg = action === CANVAS_ACTION.DOWNLOAD && format === "jpg";
      if (isJpg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const img = new Image();
      img.onload = async () => {
        ctx.drawImage(
          img,
          imagePadding / scaleFactor / 2,
          imagePadding / scaleFactor / 2,
          baseSize,
          baseSize
        );

        if (action === CANVAS_ACTION.DOWNLOAD) {
          const mime = isJpg ? "image/jpeg" : "image/png";
          const ext = isJpg ? "jpg" : "png";
          triggerDownload(
            canvas.toDataURL(mime),
            `${emojiToUnicode(currentEmoji)}-EmojiSalon.${ext}`
          );
        } else if (action === CANVAS_ACTION.COPY) {
          canvas.toBlob((blob) => {
            if (!blob) {
              toast.error(currentT("Failed to copy image."));
              return;
            }
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(() => toast.success(currentT("Image copied to clipboard.")))
              .catch(() => toast.error(currentT("Failed to copy image.")));
          });
        } else if (action === CANVAS_ACTION.SHARE) {
          const dataUrl = canvas.toDataURL();
          const blob = await (await fetch(dataUrl)).blob();
          const filesArray = [
            new File([blob], `${currentEmoji}.png`, {
              type: "image/png",
              lastModified: Date.now(),
            }),
          ];
          try {
            await navigator.share({ files: filesArray });
            toast.success(currentT("Image shared."));
          } catch (err) {
            // AbortError = user cancelled the share sheet; not a failure.
            if (!(err instanceof Error) || err.name !== "AbortError") {
              toast.error(currentT("Failed to share image."));
            }
          }
        } else if (action === CANVAS_ACTION.GENERATE_PREVIEW) {
          setResultImageSrc(canvas.toDataURL("image/png"));
        }
      };
      img.src = `data:image/svg+xml,${encodeURIComponent(svgData)}`;
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
    (format: ImageFormat = "png") => {
      if (format === "svg") {
        downloadSVG(generateSVGData(), currentEmoji);
        return;
      }
      updateCanvas(CANVAS_ACTION.DOWNLOAD, format);
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
    await updateCanvas(CANVAS_ACTION.GENERATE_PREVIEW);
    if (navigator.share && window.innerWidth < 768) {
      const shareData = {
        title: currentT("Share with friends"),
        text: "#EmojiSalon",
        url: window.location.href,
      };
      await navigator.share(shareData);
    } else {
      setShareDialogOpen(true);
    }
  }, [updateCanvas]);

  // Computed SVG HTML
  const svgHTML = generateSVGData();
  const referenceSvgHTML = generateReferenceSVG();

  const value: EmojiContextValue = {
    currentEmoji,
    setCurrentEmoji,
    currentEmojiLabel,
    setCurrentEmojiLabel,
    customizedPaletteColors,
    setCustomizedPaletteColors,
    pathArray,
    paletteArray,
    originalPaletteColors,
    originalPaletteIndex,
    shareDialogOpen,
    setShareDialogOpen,
    resultImageSrc,
    canvasRef,
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

  return <EmojiContext value={value}>{children}</EmojiContext>;
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
