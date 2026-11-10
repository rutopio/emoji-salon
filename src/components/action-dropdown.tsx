import { CheckIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useMemo, useRef, useState } from "react";
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFluidHover } from "@/hooks/use-fluid-hover";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { spring } from "@/lib/springs";
import { cn } from "@/lib/utils";

export type ActionDropdownItem = {
  id: string;
  label: string;
  depth?: 2 | 3;
  lang?: string;
  onSelect: () => void;
};

export function ActionDropdown({
  label,
  trigger,
  items,
  selectedId,
  currentValue = "true",
  side = "bottom",
  align = "end",
  variant = "ghost",
  size = "icon",
  openOnHover = true,
  className,
}: {
  label: string;
  trigger: ReactNode;
  items: ActionDropdownItem[];
  selectedId?: string;
  currentValue?: "true" | "page" | "location";
  side?: "bottom" | "left";
  align?: "start" | "end";
  variant?: "ghost" | "outline";
  size?: "icon" | "icon-lg";
  openOnHover?: boolean;
  className?: string;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const modeRef = useRef<"hover" | "click" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const focusFrame = useRef(0);
  const centerFrame = useRef(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const hover = useFluidHover(listRef, { axis: "y", nearest: true });
  const itemRefCallbacks = useMemo(
    () =>
      Array.from(
        { length: items.length },
        (_, index) => (element: HTMLButtonElement | null) => {
          itemRefs.current[index] = element;
          hover.registerItem(index, element);
        }
      ),
    [items.length, hover.registerItem]
  );

  const close = (restoreFocus = false) => {
    clearTimeout(timer.current);
    cancelAnimationFrame(focusFrame.current);
    cancelAnimationFrame(centerFrame.current);
    openRef.current = false;
    modeRef.current = null;
    setOpen(false);
    hover.setActiveIndex(null);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const focusItem = (index: number) => {
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(() => {
      itemRefs.current[index]?.focus();
    });
  };

  const openMenu = (mode: "hover" | "click", focus = false) => {
    clearTimeout(timer.current);
    if (mode === "hover" && openRef.current) return;
    const wasOpen = openRef.current;
    const index = Math.max(
      0,
      items.findIndex((item) => item.id === selectedId)
    );
    openRef.current = true;
    modeRef.current = mode;
    setFocusedIndex(index);
    setOpen(true);
    if (!wasOpen && side === "left") {
      centerFrame.current = requestAnimationFrame(() => {
        const viewport = menuRef.current?.querySelector<HTMLElement>(
          '[data-slot="scroll-area-viewport"]'
        );
        const active = viewport?.querySelector<HTMLElement>("[data-active]");
        if (!viewport || !active) return;
        const viewportRect = viewport.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        viewport.scrollTop +=
          activeRect.top -
          viewportRect.top -
          viewport.clientHeight / 2 +
          activeRect.height / 2;
      });
    }
    if (focus) {
      hover.setActiveIndex(index);
      focusItem(index);
    }
  };

  useMountEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (openRef.current && !rootRef.current?.contains(event.target as Node))
        close();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      clearTimeout(timer.current);
      cancelAnimationFrame(focusFrame.current);
      cancelAnimationFrame(centerFrame.current);
    };
  });

  const move = (index: number) => {
    if (items.length === 0) return;
    const next = (index + items.length) % items.length;
    openRef.current = true;
    modeRef.current = "click";
    setOpen(true);
    setFocusedIndex(next);
    hover.setActiveIndex(next);
    focusItem(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(openRef.current ? focusedIndex + 1 : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(openRef.current ? focusedIndex - 1 : items.length - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(0);
    } else if (event.key === "End") {
      event.preventDefault();
      move(items.length - 1);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: A fieldset changes nested button layout and form behavior.
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      className="relative"
      onMouseEnter={() => {
        if (!openOnHover) return;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => openMenu("hover"), 200);
      }}
      onMouseLeave={() => {
        if (modeRef.current !== "click") close();
      }}
      onBlurCapture={(event) => {
        if (
          modeRef.current !== "click" &&
          !rootRef.current?.contains(event.relatedTarget as Node | null)
        )
          close();
      }}
    >
      <Button
        ref={triggerRef}
        type="button"
        variant={variant}
        size={size}
        className={className}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (openRef.current && modeRef.current === "click") close();
          else openMenu("click", true);
        }}
        onKeyDown={onKeyDown}
      >
        {trigger}
      </Button>
      <AnimatePresence>
        {open && (
          <div
            className={cn(
              "absolute z-50",
              side === "left"
                ? "top-1/2 right-full w-96 max-w-[calc(100vw-4rem)] -translate-y-1/2 pr-2"
                : cn(
                    "top-full min-w-56 pt-2",
                    align === "end" ? "right-0" : "left-0"
                  )
            )}
          >
            <motion.div
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : side === "left"
                    ? { opacity: 0, scale: 0.97, x: 8 }
                    : { opacity: 0, scale: 0.96, y: -4 }
              }
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.97,
                transition: spring.moderate.exit,
              }}
              transition={spring.moderate}
              style={{
                transformOrigin:
                  side === "left"
                    ? "center right"
                    : align === "end"
                      ? "top right"
                      : "top left",
              }}
              className="rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              <ScrollArea
                ref={menuRef}
                scrollFade
                overscrollContain
                className="h-auto! max-h-[calc(50dvh-0.625rem)] w-full [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:right-[-3px]! [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-1! [&_[data-slot=scroll-area-scrollbar]]:m-0.5 [&_[data-slot=scroll-area-thumb]]:bg-foreground/10! [&_[data-slot=scroll-area-viewport]]:max-h-[calc(50dvh-0.625rem)] data-has-overflow-y:[&_[role=menu]]:pr-2"
              >
                <div
                  ref={listRef}
                  id={id}
                  role="menu"
                  aria-label={label}
                  onKeyDown={onKeyDown}
                  {...hover.handlers}
                  className="relative"
                >
                  <FluidHoverHighlight hover={hover} className="rounded-md" />
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      ref={itemRefCallbacks[index]}
                      type="button"
                      role="menuitem"
                      lang={item.lang}
                      data-active={selectedId === item.id || undefined}
                      aria-current={
                        selectedId === item.id ? currentValue : undefined
                      }
                      onPointerMove={() => setFocusedIndex(index)}
                      onFocus={() => {
                        setFocusedIndex(index);
                        hover.setActiveIndex(index);
                      }}
                      onClick={() => {
                        close(true);
                        item.onSelect();
                      }}
                      className={cn(
                        "relative flex min-h-8 w-full min-w-0 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-base focus-visible:outline-none",
                        selectedId === item.id && "font-bold text-primary"
                      )}
                    >
                      <span
                        className={cn("min-w-0", item.depth === 3 && "pl-4")}
                      >
                        {item.label}
                      </span>
                      {selectedId === item.id && side === "bottom" && (
                        <CheckIcon aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
