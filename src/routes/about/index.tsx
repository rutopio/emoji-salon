import { Article, ArticleSection } from "@rutopio/ui/article";
import { PageIntro } from "@rutopio/ui/page-intro";
/**
 * @fileoverview About page route for EmojiSalon.
 * Provides information about the application, how it works, accessibility,
 * copyright, and open source details.
 */

import { GithubMarkIcon } from "@rutopio/ui/github-mark-icon";
import { createFileRoute } from "@tanstack/react-router";
import { AboutPageActions } from "@/components/about-page-actions";
import { ArticleHeading } from "@/components/article-heading";
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
      <Article className="py-6 sm:py-12">
        <header className="flex flex-col gap-6">
          <PageIntro title={c.heading} />
          <p className="text-pretty">{c.intro}</p>
        </header>
        <ArticleSection
          heading={<ArticleHeading id="how-it-works">{c.how}</ArticleHeading>}
        >
          <p>{c.howIntro}</p>
          {list(c.steps, true)}
        </ArticleSection>
        <ArticleSection
          heading={
            <ArticleHeading id="accessibility">
              {c.accessibility}
            </ArticleHeading>
          }
        >
          <p>{c.accessIntro}</p>
          <div className="flex flex-col gap-16">
            <ArticleSection
              heading={
                <ArticleHeading id="challenges" level={3}>
                  {c.challenges}
                </ArticleHeading>
              }
            >
              <p>{c.challengesIntro}</p>
              {list(c.challengesList)}
            </ArticleSection>
            <ArticleSection
              heading={
                <ArticleHeading id="commonly-confused-emoji" level={3}>
                  {c.examples}
                </ArticleHeading>
              }
            >
              <div className="flex flex-col gap-6">
                <p>{c.flagsIntro}</p>
                {list(c.flags)}
                <p className="pt-2">{c.heartsIntro}</p>
                {list(c.hearts)}
              </div>
            </ArticleSection>
            <ArticleSection
              heading={
                <ArticleHeading id="how-emoji-salon-helps" level={3}>
                  {c.help}
                </ArticleHeading>
              }
            >
              <p>{c.helpIntro}</p>
              {list(c.helpList)}
              <p>{c.helpOutro}</p>
            </ArticleSection>
            <ArticleSection
              heading={
                <ArticleHeading id="see-more" level={3}>
                  {c.seeMore}
                </ArticleHeading>
              }
            >
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
            </ArticleSection>
          </div>
        </ArticleSection>
        <ArticleSection
          heading={
            <ArticleHeading id="copyright-license">
              {c.copyright}
            </ArticleHeading>
          }
        >
          <div className="flex flex-col gap-16 text-pretty">
            <ArticleSection
              heading={
                <ArticleHeading id="graphics" level={3}>
                  {c.graphics}
                </ArticleHeading>
              }
            >
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
            </ArticleSection>
            <ArticleSection
              heading={
                <ArticleHeading id="code" level={3}>
                  {c.code}
                </ArticleHeading>
              }
            >
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
            </ArticleSection>
          </div>
        </ArticleSection>
        <ArticleSection
          heading={
            <ArticleHeading id="open-source">{c.openSource}</ArticleHeading>
          }
        >
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
        </ArticleSection>
      </Article>
      <AboutPageActions />
    </PageLayout>
  );
}
