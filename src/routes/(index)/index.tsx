import { createFileRoute } from "@tanstack/react-router";
import ActionButtons from "@/components/create/action-buttons";
import ColorPalettePickers from "@/components/create/color-palette-pickers";
import CreateShareDialog from "@/components/create/create-share-dialog";
import EmojiDisplay from "@/components/create/emoji-display";
import DesktopEmojiPicker from "@/components/create/emoji-picker";
import PageLayout from "@/components/layout/page-layout";
import { EmojiProvider } from "@/contexts/emoji-context";
import { useT } from "@/hooks/use-translation";
import { pageHead } from "@/lib/page-meta";
import { prepareEmojiRoute } from "@/lib/prepare-emoji-route";

interface EmojiSearchParams {
  emoji?: string;
  palette?: string;
}

export const Route = createFileRoute("/(index)/")({
  component: EmojiSalonPage,
  beforeLoad: prepareEmojiRoute,
  validateSearch: (search: Record<string, unknown>): EmojiSearchParams => {
    return {
      emoji: typeof search.emoji === "string" ? search.emoji : undefined,
      palette: typeof search.palette === "string" ? search.palette : undefined,
    };
  },
  head: () => pageHead("en", "create"),
});

export function EmojiSalonPage() {
  return (
    <EmojiProvider>
      <EmojiSalonContent />
    </EmojiProvider>
  );
}

function EmojiSalonContent() {
  const t = useT();

  return (
    <PageLayout>
      <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-16 py-6 sm:py-12 lg:w-[calc(100vw-3rem)] lg:max-w-5xl lg:flex-none">
        <h1 className="sr-only">{t("Create Your Custom Emoji")}</h1>
        <div className="grid grid-cols-1 items-center lg:grid-cols-3 lg:gap-16">
          <DesktopEmojiPicker />
          <ActionButtons variant="mobile" />
          <EmojiDisplay variant="customized" />
          <EmojiDisplay variant="reference" />
        </div>

        <ActionButtons variant="desktop" />
        <ColorPalettePickers />
      </div>

      <CreateShareDialog />
    </PageLayout>
  );
}
