/**
 * @fileoverview About page route for EmojiSalon.
 * Provides information about the application, how it works, accessibility,
 * copyright, and open source details.
 */

import { GithubLogoIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { AboutPageActions } from "@/components/about-page-actions";
import { ArticleHeading } from "@/components/article-heading";
import PageLayout from "@/layout";

import { GITHUB_REPO_URL, SITE_URL } from "@/lib/constants";

/**
 * About page route configuration.
 */
export const Route = createFileRoute("/about/")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: "About | EmojiSalon - Coloring Your Emoji",
      },
      {
        name: "description",
        content:
          "Learn how EmojiSalon works, how recoloring may help distinguish emoji, and how its artwork and code are licensed.",
      },
      {
        property: "og:title",
        content: "About | EmojiSalon - Coloring Your Emoji",
      },
      {
        property: "og:description",
        content:
          "Learn how EmojiSalon works, how recoloring may help distinguish emoji, and how its artwork and code are licensed.",
      },
      {
        property: "og:url",
        content: `${SITE_URL}/about`,
      },
      {
        property: "og:image",
        content: `${SITE_URL}/social.png`,
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
});

/**
 * About page component.
 * Displays information about EmojiSalon including how it works,
 * accessibility considerations, copyright information, and open source details.
 *
 * @returns About page component.
 */
function AboutPage() {
  return (
    <PageLayout>
      <article className="flex w-full min-w-0 flex-1 flex-col gap-16 py-6 text-base text-neutral-800 tabular-nums leading-[1.65] sm:py-12 dark:text-neutral-300">
        {/* Hero section */}
        <header className="flex flex-col gap-6">
          <h1 className="text-balance font-bold text-lg text-neutral-950 leading-[1.65] dark:text-neutral-50">
            About EmojiSalon
          </h1>
          <p className="text-pretty text-base">
            EmojiSalon allows you to customize the colors of emojis, just like
            dressing them up with various cosmetics or coloring them with
            different paints.
          </p>
        </header>

        {/* How it works section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="how-it-works">How it works</ArticleHeading>
          <p className="text-pretty">
            EmojiSalon uses Twemoji artwork. Choose an emoji and edit its colors
            in three steps:
          </p>
          <ol className="ml-6 flex list-decimal flex-col gap-2">
            <li>Select an emoji from the picker or choose Random Emoji.</li>
            <li>
              Use the color swatches to change its palette. Select Reset Palette
              to restore the original colors.
            </li>
            <li>
              Save or share your result. On desktop, Save Image offers SVG, PNG,
              JPG, and Copy. On smaller screens, Save Image copies the image.
              Share Link creates a URL with your emoji and colors.
            </li>
          </ol>
        </section>

        {/* Accessibility section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="accessibility">Accessibility</ArticleHeading>
          <p className="text-pretty">
            People see and distinguish colors in different ways. Recoloring may
            make an emoji easier for some people to recognize, but the result
            depends on the person, emoji, and size.
          </p>

          <div className="flex flex-col gap-16">
            {/* Challenges */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="challenges" level={3}>
                What can make emoji hard to distinguish
              </ArticleHeading>
              <p className="text-pretty">
                Color vision differences or low vision can make some emoji
                harder to distinguish:
              </p>
              <ul className="ml-6 flex list-disc flex-col gap-1">
                <li>
                  similar colors can make parts of an emoji blend together
                </li>
                <li>
                  emoji that differ mainly by color may be difficult to tell
                  apart
                </li>
                <li>
                  fine details can disappear when an emoji is shown at a small
                  size
                </li>
              </ul>
            </div>

            {/* Commonly Confused Emoji */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="commonly-confused-emoji" level={3}>
                Examples of similar emoji
              </ArticleHeading>
              <div className="flex flex-col gap-6">
                <p>Some flag emoji have similar color schemes:</p>
                <ul className="ml-6 flex list-disc flex-col gap-1">
                  <li>🇮🇹 Italy / 🇮🇪 Ireland</li>
                  <li>🇷🇴 Romania / 🇹🇩 Chad</li>
                  <li>🇱🇻 Latvia / 🇦🇹 Austria</li>
                  <li>🇲🇨 Monaco / 🇮🇩 Indonesia</li>
                </ul>
                <p className="pt-2">
                  Heart emoji can also rely on color to convey a difference:
                </p>
                <ul className="ml-6 flex list-disc flex-col gap-1">
                  <li>❤️ Red / 💜 Purple</li>
                  <li>💙 Blue / 💜 Purple</li>
                  <li>💚 Green / 🧡 Orange</li>
                </ul>
              </div>
            </div>

            {/* How recoloring may help */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="how-emoji-salon-helps" level={3}>
                How recoloring may help
              </ArticleHeading>
              <p className="text-pretty">
                EmojiSalon lets you try colors that work better for you or your
                audience. You can:
              </p>
              <ul className="ml-6 flex list-disc flex-col gap-1">
                <li>increase contrast between editable parts of an emoji</li>
                <li>
                  use more distinct colors when placing similar emoji together
                </li>
              </ul>
              <p className="text-pretty">
                These changes apply to images you save or share. They do not
                change emoji in a device's keyboard. If an emoji carries
                important information, include a text label or alternative text.
              </p>
            </div>

            {/* See more */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="see-more" level={3}>
                See more
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

        {/* Copyright section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="copyright-license">
            Copyright & License
          </ArticleHeading>
          <div className="flex flex-col gap-16 text-pretty">
            {/* Graphics License */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="graphics" level={3}>
                Graphics
              </ArticleHeading>
              <div className="flex justify-center py-2">
                <img
                  src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by.png"
                  alt="Creative Commons Attribution 4.0 International License badge"
                  className="h-8 w-auto"
                />
              </div>
              <p>
                Your creation is based on{" "}
                <a
                  href="https://github.com/jdecked/twemoji"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Twemoji
                </a>
                , licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  CC-BY 4.0
                </a>{" "}
                (graphic).
              </p>
              <p>
                This license enables reusers to distribute, remix, adapt, and
                build upon the material in any medium or format, so long as
                attribution is given to the creator. The license allows for
                commercial use.
              </p>
              <p className="font-medium">
                The author does not own any copyright to your work.
              </p>
            </div>

            {/* Code License */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="code" level={3}>
                Code
              </ArticleHeading>
              <p>
                Code licensed under the{" "}
                <a
                  href="http://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  MIT License
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Open source section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="open-source">Open Source</ArticleHeading>
          <p>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="whitespace-nowrap text-primary underline decoration-[0.5px] underline-offset-4 transition-[color,text-decoration-thickness] duration-150 hover:text-neutral-950 hover:decoration-[1px] dark:hover:text-neutral-50"
            >
              <GithubLogoIcon
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
