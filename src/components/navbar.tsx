import { CheckIcon, GithubLogoIcon, ListIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@rutopio/base-component/button";
import { LanguageToggle } from "@rutopio/base-component/language-toggle";
import {
  HeaderNavigation,
  SiteHeader,
} from "@rutopio/base-component/site-header";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { EMOJI_SALON_ICON_PATH } from "@/lib/brand-icon";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { localeForPath, locales, stripLocale, withLocale } from "@/lib/locale";
import { useT } from "@/lib/translations";

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
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <GithubLogoIcon className="size-4" aria-hidden="true" />
          </a>
          <LanguageToggle
            label={t("Language")}
            current={locale}
            options={locales.map((item) => ({
              value: item.code,
              label: item.label,
              htmlLang: item.htmlLang,
            }))}
            isMobile={isMobile}
            titleClassName="cn-font-heading"
            onChange={(value) =>
              navigate({
                to: withLocale(pathname, value),
                search: (previous) => previous,
                hash: true,
              })
            }
          />
          <ThemeToggle />
        </>
      }
    />
  );
}
