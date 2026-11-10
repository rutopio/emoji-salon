import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import {
  CheckIcon,
  GithubLogoIcon,
  ListIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { FluidHoverControls } from "@/components/fluid-hover-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { EMOJI_SALON_ICON_PATH } from "@/lib/brand-icon";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { localeForPath, locales, stripLocale, withLocale } from "@/lib/locale";
import { useT } from "@/lib/translations";
import { cn } from "@/lib/utils";

const routeLinkClass =
  "flex h-9 items-center whitespace-nowrap rounded-lg px-3 font-medium text-base text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-muted";
const routeMenuItemClass =
  "flex cursor-default items-center justify-between gap-2 rounded-sm px-3 py-1.5 text-base text-foreground outline-none focus:bg-accent focus:text-accent-foreground";
const headerActionClass =
  "cursor-default transition-[background-color,border-color,color,opacity,box-shadow,scale] duration-150 ease-in-out active:scale-[0.96] active:translate-y-0!";

export default function Navbar() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const t = useT();
  const locale = localeForPath(pathname);
  const barePath = stripLocale(pathname);
  const isHome = barePath === "/";
  const isShowcase = barePath === "/showcase" || barePath === "/showcase/";
  const isAbout = barePath === "/about" || barePath === "/about/";
  const localized = (path: string) => withLocale(path, locale);

  return (
    <header className="w-full bg-background">
      <nav
        aria-label={t("Main navigation")}
        className="relative flex w-full items-center justify-between pt-6 font-sans sm:pt-12"
      >
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link
            to={localized("/")}
            activeOptions={{ exact: true }}
            aria-label={t("EmojiSalon home")}
            className="flex h-12 shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="flex size-12 items-center justify-center">
              <svg
                aria-hidden="true"
                className="h-8 w-7 text-foreground"
                fill="currentColor"
                viewBox="0 0 632 739"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={EMOJI_SALON_ICON_PATH} />
              </svg>
            </span>
          </Link>
          <div className="md:hidden">
            <MenuPrimitive.Root>
              <MenuPrimitive.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={t("Pages")}
                  >
                    <ListIcon aria-hidden="true" />
                  </Button>
                }
              />
              <MenuPrimitive.Portal>
                <MenuPrimitive.Positioner
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="isolate z-50 outline-none"
                >
                  <MenuPrimitive.Popup
                    aria-label={t("Pages")}
                    className="z-50 min-w-40 rounded-md bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10"
                  >
                    <MenuPrimitive.Item
                      aria-current={isHome ? "page" : undefined}
                      className={routeMenuItemClass}
                      onClick={() => navigate({ to: localized("/") })}
                    >
                      {t("Create")} {isHome && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                    <MenuPrimitive.Item
                      aria-current={isShowcase ? "page" : undefined}
                      className={routeMenuItemClass}
                      onClick={() => navigate({ to: localized("/showcase") })}
                    >
                      {t("Showcase")}{" "}
                      {isShowcase && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                    <MenuPrimitive.Item
                      aria-current={isAbout ? "page" : undefined}
                      className={routeMenuItemClass}
                      onClick={() => navigate({ to: localized("/about") })}
                    >
                      {t("About")} {isAbout && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                  </MenuPrimitive.Popup>
                </MenuPrimitive.Positioner>
              </MenuPrimitive.Portal>
            </MenuPrimitive.Root>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to={localized("/")}
              activeOptions={{ exact: true }}
              aria-current={isHome ? "page" : undefined}
              className={cn(routeLinkClass, isHome && "bg-muted")}
            >
              {t("Create")}
            </Link>
            <Link
              to={localized("/showcase")}
              activeOptions={{ exact: true }}
              aria-current={isShowcase ? "page" : undefined}
              className={cn(routeLinkClass, isShowcase && "bg-muted")}
            >
              {t("Showcase")}
            </Link>
            <Link
              to={localized("/about")}
              activeOptions={{ exact: true }}
              aria-current={isAbout ? "page" : undefined}
              className={cn(routeLinkClass, isAbout && "bg-muted")}
            >
              {t("About")}
            </Link>
          </div>
        </div>
        <FluidHoverControls compact label={t("Header actions")}>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("GitHub (opens in a new tab)")}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              headerActionClass
            )}
          >
            <GithubLogoIcon className="size-4" aria-hidden="true" />
          </a>
          <MenuPrimitive.Root>
            <MenuPrimitive.Trigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={t("Language")}
                  className={headerActionClass}
                >
                  <TranslateIcon aria-hidden="true" />
                </Button>
              }
            />
            <MenuPrimitive.Portal>
              <MenuPrimitive.Positioner
                side="bottom"
                align="end"
                sideOffset={4}
                className="isolate z-50 outline-none"
              >
                <MenuPrimitive.Popup
                  aria-label={t("Language")}
                  className="min-w-36 rounded-md bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10"
                >
                  {locales.map((item) => (
                    <MenuPrimitive.Item
                      key={item.code}
                      lang={item.htmlLang}
                      aria-current={locale === item.code ? "true" : undefined}
                      className={routeMenuItemClass}
                      onClick={() =>
                        navigate({
                          to: withLocale(pathname, item.code),
                          search: (previous) => previous,
                          hash: true,
                        })
                      }
                    >
                      {item.label}{" "}
                      {locale === item.code && <CheckIcon aria-hidden="true" />}
                    </MenuPrimitive.Item>
                  ))}
                </MenuPrimitive.Popup>
              </MenuPrimitive.Positioner>
            </MenuPrimitive.Portal>
          </MenuPrimitive.Root>
          <ThemeToggle className={headerActionClass} />
        </FluidHoverControls>
      </nav>
    </header>
  );
}
