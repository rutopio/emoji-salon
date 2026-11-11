import { CheckIcon, GithubLogoIcon, ListIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@rutopio/ui/button";
import { LanguageToggle } from "@rutopio/ui/language-toggle";
import { HeaderNavigation, SiteHeader } from "@rutopio/ui/site-header";
import { useIsNarrowViewport } from "@rutopio/ui/use-is-narrow-viewport";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { useT } from "@/hooks/use-translation";
import { EMOJI_SALON_ICON_PATH } from "@/lib/brand-icon";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { localeForPath, locales, stripLocale, withLocale } from "@/lib/locale";

export default function Header() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const t = useT();
  const isNarrowViewport = useIsNarrowViewport();
  const locale = localeForPath(pathname);
  const barePath = stripLocale(pathname);
  const isHome = barePath === "/";
  const isShowcase = barePath === "/showcase" || barePath === "/showcase/";
  const isAbout = barePath === "/about" || barePath === "/about/";
  const localized = (path: string) => withLocale(path, locale);

  return (
    <SiteHeader
      className="bg-background"
      label={t("Main navigation")}
      actionsLabel={t("Header actions")}
      brand={
        <Link
          to={localized("/")}
          activeOptions={{ exact: true }}
          aria-label={t("EmojiSalon home")}
          className="focus-visible:outline-ring flex h-12 shrink-0 items-center rounded-md focus-visible:outline-2"
        >
          <span className="flex size-12 items-center justify-center">
            <svg
              aria-hidden="true"
              className="text-foreground h-8 w-7"
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
            isNarrowViewport={isNarrowViewport}
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
