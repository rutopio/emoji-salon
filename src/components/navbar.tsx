import {
  CheckIcon,
  GithubLogoIcon,
  ListIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { ActionMenu } from "@rutopio/base-component/action-menu";
import {
  HeaderNavigation,
  SiteHeader,
} from "@rutopio/base-component/site-header";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { EMOJI_SALON_ICON_PATH } from "@/lib/brand-icon";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { localeForPath, locales, stripLocale, withLocale } from "@/lib/locale";
import { useT } from "@/lib/translations";
import { cn } from "@/lib/utils";

const headerActionClass =
  "transition-[background-color,border-color,color,opacity,box-shadow,scale] duration-150 ease-in-out active:scale-[0.96] active:translate-y-0!";
const mobileQuery = "(max-width: 767px)";

function subscribeToMobile(onChange: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isMobileViewport() {
  return window.matchMedia(mobileQuery).matches;
}

export default function Navbar() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const t = useT();
  const [languageOpen, setLanguageOpen] = useState(false);
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    isMobileViewport,
    () => false
  );
  const locale = localeForPath(pathname);
  const barePath = stripLocale(pathname);
  const isHome = barePath === "/";
  const isShowcase = barePath === "/showcase" || barePath === "/showcase/";
  const isAbout = barePath === "/about" || barePath === "/about/";
  const localized = (path: string) => withLocale(path, locale);

  return (
    <SiteHeader
      className="bg-background"
      navClassName="font-sans"
      label={t("Main navigation")}
      actionsLabel={t("Header actions")}
      compactActions
      brand={
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
      }
      navigation={
        <HeaderNavigation
          items={[
            {
              id: "home",
              label: t("Create"),
              href: localized("/"),
              active: isHome,
            },
            {
              id: "showcase",
              label: t("Showcase"),
              href: localized("/showcase"),
              active: isShowcase,
            },
            {
              id: "about",
              label: t("About"),
              href: localized("/about"),
              active: isAbout,
            },
          ]}
          label={t("Pages")}
          title="EmojiSalon"
          titleClassName="cn-font-heading"
          menuIcon={<ListIcon aria-hidden="true" />}
          selectedIcon={<CheckIcon aria-hidden="true" />}
          renderLink={(item, props) => (
            <Link
              to={item.href}
              activeOptions={{ exact: true }}
              aria-current={props.ariaCurrent}
              onClick={props.onClick}
              className={props.className}
            >
              {props.children}
            </Link>
          )}
        />
      }
      actions={
        <>
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
          {isMobile ? (
            <Drawer open={languageOpen} onOpenChange={setLanguageOpen}>
              <DrawerTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={headerActionClass}
                    aria-label={t("Language")}
                  >
                    <TranslateIcon aria-hidden="true" />
                  </Button>
                }
              />
              <DrawerContent>
                <DrawerHeader className="border-border border-b pb-4">
                  <DrawerTitle>{t("Language")}</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-1 px-4 pt-4 pb-6">
                  {locales.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      lang={item.htmlLang}
                      aria-current={locale === item.code ? "true" : undefined}
                      className="flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-base text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=true]:bg-muted"
                      onClick={() => {
                        setLanguageOpen(false);
                        navigate({
                          to: withLocale(pathname, item.code),
                          search: (previous) => previous,
                          hash: true,
                        });
                      }}
                    >
                      {item.label}
                      {locale === item.code && <CheckIcon aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <ActionMenu
              label={t("Language")}
              trigger={<TranslateIcon aria-hidden="true" />}
              triggerClassName={headerActionClass}
              indicator={<CheckIcon className="size-4" />}
              items={locales.map((item) => ({
                id: item.code,
                label: item.label,
                lang: item.htmlLang,
                active: locale === item.code,
                ariaCurrent:
                  locale === item.code ? ("true" as const) : undefined,
                onSelect: () =>
                  navigate({
                    to: withLocale(pathname, item.code),
                    search: (previous) => previous,
                    hash: true,
                  }),
              }))}
            />
          )}
          <ThemeToggle className={headerActionClass} />
        </>
      }
    />
  );
}
