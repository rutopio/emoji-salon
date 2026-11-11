import {
  ArrowBendRightUpIcon,
  ArrowLeftIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { ActionMenu } from "@rutopio/ui/action-menu";
import { Button } from "@rutopio/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@rutopio/ui/drawer";
import { OutlineList } from "@rutopio/ui/outline-list";
import { ReadingProgressRing } from "@rutopio/ui/outline-nav";
import { PageActionRail } from "@rutopio/ui/page-action-rail";
import { shareOrCopyCurrentPage } from "@rutopio/ui/page-share";
import { navigateToSection } from "@rutopio/ui/section-navigation";
import { useMountEffect } from "@rutopio/ui/use-mount-effect";
import { useState } from "react";
import { toast } from "sonner";
import { useT } from "@/lib/translations";

interface OutlineItem {
  id: string;
  label: string;
  depth: 2 | 3;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AboutPageActions() {
  const t = useT();
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const selectedId = activeId || items[0]?.id || "";

  useMountEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main article h2[id], main article h3[id]"
      )
    );
    setItems(
      headings.map((heading) => ({
        id: heading.id,
        label: heading.textContent?.trim() ?? "",
        depth: heading.tagName === "H3" ? 3 : 2,
      }))
    );

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      setProgress(
        scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 1
      );
      const line = scrollY + Math.max(120, Math.round(window.innerHeight / 3));
      let current = "";
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top + scrollY <= line)
          current = heading.id;
      }
      if (scrollY >= scrollable - 2) current = headings.at(-1)?.id ?? current;
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  });

  const navigateToHeading = (id: string) => {
    navigateToSection(id, () => setOutlineOpen(false));
  };

  const sharePage = () =>
    shareOrCopyCurrentPage({
      onCopied: () => toast.success(t("Page link copied.")),
      onShareError: () => toast.error(t("Could not share this page.")),
      onCopyError: () => toast.error(t("Could not copy the page link.")),
    });

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });

  const utilities = (
    <>
      <Button
        variant="outline"
        size="icon-lg"
        aria-label={t("Share or copy page link")}
        onClick={sharePage}
      >
        <ShareNetworkIcon aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="icon-lg"
        aria-label={t("Scroll to top")}
        onClick={scrollToTop}
      >
        <ArrowBendRightUpIcon aria-hidden="true" />
      </Button>
    </>
  );

  return (
    <PageActionRail
      label={t("About page actions")}
      mobileOutline={
        <>
          <Drawer open={outlineOpen} onOpenChange={setOutlineOpen}>
            <DrawerTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label={`${Math.round(progress * 100)}% · ${t("Table of contents")}`}
                />
              }
            >
              <ReadingProgressRing progress={progress} />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="border-border border-b pb-4">
                <DrawerTitle>{t("About EmojiSalon")}</DrawerTitle>
              </DrawerHeader>
              <nav
                aria-label={t("Table of contents")}
                className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6"
              >
                <OutlineList
                  items={items}
                  activeId={selectedId}
                  onNavigate={navigateToHeading}
                  indicator={<ArrowLeftIcon className="size-4" />}
                />
              </nav>
            </DrawerContent>
          </Drawer>
        </>
      }
      desktopOutline={
        <>
          <ActionMenu
            label={`${Math.round(progress * 100)}% · ${t("Table of contents")}`}
            trigger={<ReadingProgressRing progress={progress} />}
            items={items.map((item) => ({
              ...item,
              active: item.id === selectedId,
              ariaCurrent:
                item.id === selectedId ? ("location" as const) : undefined,
              href: `#${encodeURIComponent(item.id)}`,
              onSelect: (event) => {
                event.preventDefault();
                navigateToHeading(item.id);
              },
            }))}
            indicator={
              <ArrowLeftIcon className="size-4 shrink-0" aria-hidden="true" />
            }
            side="left"
          />
        </>
      }
      actions={utilities}
    />
  );
}
