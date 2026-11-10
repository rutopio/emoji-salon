import { ArrowBendRightUpIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { ActionDropdown } from "@/components/action-dropdown";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useT } from "@/lib/translations";

interface OutlineItem {
  id: string;
  label: string;
  depth: 2 | 3;
}

const circumference = 2 * Math.PI * 6.25;

function ReadingProgressRing({ progress }: { progress: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 -rotate-90">
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={(1 - progress) * circumference}
      />
    </svg>
  );
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
    setOutlineOpen(false);
    const reduceMotion = prefersReducedMotion();
    window.setTimeout(
      () => {
        document.getElementById(id)?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
        });
        history.replaceState(null, "", `#${encodeURIComponent(id)}`);
      },
      reduceMotion ? 0 : 350
    );
  };

  const sharePage = async () => {
    const url = window.location.href;
    if (window.matchMedia("(pointer: coarse)").matches && navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError"))
          toast.error(t("Could not share this page."));
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("Page link copied."));
    } catch {
      toast.error(t("Could not copy the page link."));
    }
  };

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
    <>
      <ButtonGroup
        orientation="horizontal"
        aria-label={t("About page actions")}
        className="fixed right-4 bottom-[calc(2rem+env(safe-area-inset-bottom))] z-10 h-fit min-[50rem]:hidden"
      >
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
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={
                      item.depth === 3
                        ? "ml-3 border-primary/20 border-l pl-3"
                        : undefined
                    }
                  >
                    <a
                      href={`#${item.id}`}
                      aria-current={
                        activeId === item.id ? "location" : undefined
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        navigateToHeading(item.id);
                      }}
                      className="block py-1 text-base text-foreground aria-[current=location]:font-bold"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </DrawerContent>
        </Drawer>
        {utilities}
      </ButtonGroup>

      <ButtonGroup
        orientation="vertical"
        aria-label={t("About page actions")}
        className="fixed top-1/2 left-[var(--gutter-offset)] z-10 hidden h-fit -translate-y-1/2 min-[50rem]:flex"
      >
        <ActionDropdown
          label={`${Math.round(progress * 100)}% · ${t("Table of contents")}`}
          trigger={<ReadingProgressRing progress={progress} />}
          items={items.map((item) => ({
            ...item,
            onSelect: () => navigateToHeading(item.id),
          }))}
          selectedId={activeId}
          currentValue="location"
          side="left"
          variant="outline"
          size="icon-lg"
        />
        {utilities}
      </ButtonGroup>
    </>
  );
}
