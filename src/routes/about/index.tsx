/**
 * @fileoverview About page route for EmojiSalon.
 * Provides information about the application, how it works, accessibility,
 * copyright, and open source details.
 */

import { createFileRoute } from "@tanstack/react-router";
import { AboutPageActions } from "@/components/about-page-actions";
import { ArticleHeading } from "@/components/article-heading";
import { GithubMarkIcon } from "@/components/github-mark-icon";
import PageLayout from "@/layout";
import { aboutCopy } from "@/lib/about-copy";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { pageHead } from "@/lib/page-meta";
import { useLocale } from "@/lib/use-locale";

/**
 * About page route configuration.
 */
export const Route = createFileRoute("/about/")({
  component: AboutPage,
  head: () => pageHead("en", "about"),
});

/**
 * About page component.
 * Displays information about EmojiSalon including how it works,
 * accessibility considerations, copyright information, and open source details.
 *
 * @returns About page component.
 */
export function AboutPage() {
  const locale = useLocale();
  const c = aboutCopy[locale];
  const list = (items: string[], ordered = false) => {
    const Class = ordered
      ? "ml-6 flex list-decimal flex-col gap-2"
      : "ml-6 flex list-disc flex-col gap-1";
    return ordered ? (
      <ol className={Class}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    ) : (
      <ul className={Class}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  };
  return (
    <PageLayout>
      <article className="flex w-full min-w-0 flex-1 flex-col gap-16 py-6 text-base text-neutral-800 tabular-nums leading-[1.65] sm:py-12 dark:text-neutral-300">
        <header className="flex flex-col gap-6">
          <h1 className="text-balance font-bold text-lg text-neutral-950 leading-[1.65] dark:text-neutral-50">
            {c.heading}
          </h1>
          <p className="text-pretty">{c.intro}</p>
        </header>
        <section className="flex flex-col gap-6">
          <ArticleHeading id="how-it-works">{c.how}</ArticleHeading>
          <p>{c.howIntro}</p>
          {list(c.steps, true)}
        </section>
        <section className="flex flex-col gap-6">
          <ArticleHeading id="accessibility">{c.accessibility}</ArticleHeading>
          <p>{c.accessIntro}</p>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-6">
              <ArticleHeading id="challenges" level={3}>
                {c.challenges}
              </ArticleHeading>
              <p>{c.challengesIntro}</p>
              {list(c.challengesList)}
            </div>
            <div className="flex flex-col gap-6">
              <ArticleHeading id="commonly-confused-emoji" level={3}>
                {c.examples}
              </ArticleHeading>
              <div className="flex flex-col gap-6">
                <p>{c.flagsIntro}</p>
                {list(c.flags)}
                <p className="pt-2">{c.heartsIntro}</p>
                {list(c.hearts)}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <ArticleHeading id="how-emoji-salon-helps" level={3}>
                {c.help}
              </ArticleHeading>
              <p>{c.helpIntro}</p>
              {list(c.helpList)}
              <p>{c.helpOutro}</p>
            </div>
            <div className="flex flex-col gap-6">
              <ArticleHeading id="see-more" level={3}>
                {c.seeMore}
              </ArticleHeading>
              <ul className="ml-6 flex list-disc flex-col gap-1">
                <li>
                  <a
                    href="https://veroniiiica.com/emoji-and-low-vision/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Emoji And Low Vision - Veronica With Four Eyes
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/ColourBlindVision/posts/are-you-emoji-colour-blinda-strange-concept-to-say-nevertheless-how-many-times-h/678523570194699/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    Are you emoji colour blind? - Colour Blind Vision
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-6">
          <ArticleHeading id="copyright-license">{c.copyright}</ArticleHeading>
          <div className="flex flex-col gap-16 text-pretty">
            <div className="flex flex-col gap-6">
              <ArticleHeading id="graphics" level={3}>
                {c.graphics}
              </ArticleHeading>
              <div className="flex justify-center py-2">
                <img
                  src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by.png"
                  alt={c.badgeAlt}
                  className="h-8 w-auto"
                />
              </div>
              <p>
                {c.graphicPrefix}
                <a
                  href="https://github.com/jdecked/twemoji"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Twemoji
                </a>
                {c.graphicMiddle}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  CC-BY 4.0
                </a>
                {c.graphicSuffix}
              </p>
              <p>{c.graphicsTerms}</p>
              <p className="font-medium">{c.graphicsNoCopyright}</p>
            </div>
            <div className="flex flex-col gap-6">
              <ArticleHeading id="code" level={3}>
                {c.code}
              </ArticleHeading>
              <p>
                {c.codePrefix}
                <a
                  href="http://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  MIT License
                </a>
                {c.codeSuffix}
              </p>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-6">
          <ArticleHeading id="open-source">{c.openSource}</ArticleHeading>
          <p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="whitespace-nowrap text-primary underline decoration-[0.5px] underline-offset-4 transition-[color,text-decoration-thickness] duration-150 hover:text-neutral-950 hover:decoration-[1px] dark:hover:text-neutral-50"
            >
              <GithubMarkIcon
                aria-hidden="true"
                className="mr-1 inline-block size-4 align-[-0.125em]"
              />
              rutopio/emoji-salon
            </a>
          </p>
        </section>
      </article>
      <AboutPageActions />
    </PageLayout>
  );
}
