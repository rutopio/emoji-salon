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

interface EmojiContextValue {
  currentEmoji: string;
  currentEmojiLabel: string;
  customizedPaletteColors: string[];

  pathArray: string[];
  paletteArray: string[];
  originalPaletteColors: string[];
  originalPaletteIndex: number[];

  shareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
  resultImageSrc: string;

  svgHTML: string;
  referenceSvgHTML: string;

  handleEmojiSelect: (emoji: string, label: string) => void;
  handleColorChange: (index: number, color: string) => void;
  handleRandomEmoji: () => void;
  handleRandomColors: () => void;
  handleReset: () => void;
  handleDownloadImage: (format?: ImageFormat) => void;
  handleCopyImage: () => void;
  handleShare: () => Promise<void>;
}

type ImageFormat = "png" | "jpg" | "svg";

const EmojiContext = createContext<EmojiContextValue | null>(null);

const CANVAS_ACTION = {
  DOWNLOAD: 1,
  COPY: 2,
  SHARE: 3,
  GENERATE_PREVIEW: 4,
} as const;

interface EmojiProviderProps {
  children: React.ReactNode;
}

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

  const [shareDialogOpen, setShareDialogOpenState] = useState(false);
  const [resultImageSrc, setResultImageSrc] = useState<string>("");

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

  const updateURL = useCallback(
    (emojiUnicode: string, paletteCode?: string) => {
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

  const handleEmojiSelect = useCallback(
    (emoji: string, label: string) => {
      void updateEmoji(emoji, label);
    },
    [updateEmoji]
  );

  // Debounce share-URL writes while applying drag colors immediately.
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

  const handleRandomEmoji = useCallback(() => {
    const { emoji, label } = getRandomEmojiWithLabel();
    void updateEmoji(emoji, label);
  }, [updateEmoji]);

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

  const generateReferenceSVG = useCallback(() => {
    if (pathArray.length === 0 || paletteArray.length === 0) return "";

    const svgPaths = pathArray.map((d, index) => {
      return `<path fill="${paletteArray[index]}" d="${d}" />`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" width="16em" height="16em" viewBox="0 0 36 36"><g transform="translate(0,0) scale(1,1)">${svgPaths.join("\n")}</g></svg>`;
  }, [pathArray, paletteArray]);

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

  const handleCopyImage = useCallback(() => {
    // Let updateCanvas report success after the clipboard write or share completes.
    if (typeof navigator.canShare === "function") {
      updateCanvas(CANVAS_ACTION.SHARE);
    } else {
      updateCanvas(CANVAS_ACTION.COPY);
    }
  }, [updateCanvas]);

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

export function useEmoji(): EmojiContextValue {
  const context = use(EmojiContext);
  if (!context) {
    throw new Error("useEmoji must be used within an EmojiProvider");
  }
  return context;
}
