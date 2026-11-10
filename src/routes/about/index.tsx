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
          "How EmojiSalon works, how recoloring can help tell emoji apart, and how the artwork and code are licensed.",
      },
      {
        property: "og:title",
        content: "About | EmojiSalon - Coloring Your Emoji",
      },
      {
        property: "og:description",
        content:
          "How EmojiSalon works, how recoloring can help tell emoji apart, and how the artwork and code are licensed.",
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
            About
          </h1>
          <p className="text-pretty text-base">
            EmojiSalon lets you change the colors of any emoji — like giving it
            a makeover or a fresh coat of paint.
          </p>
        </header>

        {/* How it works section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="how-it-works">How it works</ArticleHeading>
          <p className="text-pretty">
            EmojiSalon uses Twemoji artwork. Pick an emoji and change its colors
            in 3 steps:
          </p>
          <ol className="ml-6 flex list-decimal flex-col gap-2">
            <li>Pick an emoji from the picker, or choose Random Emoji.</li>
            <li>
              Use the color swatches to change its palette. Choose Reset Palette
              to go back to the original colors.
            </li>
            <li>
              Save or share what you made. On desktop, Save Image lets you
              choose SVG, PNG, JPG, or Copy. On smaller screens it copies the
              image directly. Share Link creates a URL that includes your emoji
              and color choices.
            </li>
          </ol>
        </section>

        {/* Accessibility section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="accessibility">Accessibility</ArticleHeading>
          <p className="text-pretty">
            People see and tell colors apart in different ways. Recoloring can
            make an emoji easier to recognize, but the effect depends on the
            person, the emoji, and the display size.
          </p>

          <div className="flex flex-col gap-16">
            {/* Challenges */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="challenges" level={3}>
                What makes emoji hard to tell apart
              </ArticleHeading>
              <p className="text-pretty">
                Color vision differences or low vision can make some emoji
                harder to tell apart:
              </p>
              <ul className="ml-6 flex list-disc flex-col gap-1">
                <li>
                  similar colors can make parts of an emoji blend together
                </li>
                <li>emoji that differ only by color can look the same</li>
                <li>
                  fine details disappear when an emoji is shown at a small size
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
                  Heart emoji also rely on color alone to show a difference:
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
                <li>raise the contrast between parts of an emoji</li>
                <li>
                  use more distinct colors so similar emoji are easier to tell
                  apart
                </li>
              </ul>
              <p className="text-pretty">
                These changes only apply to the images you save or share. They
                do not change the emoji on your device's keyboard. If an emoji
                carries meaning, pair it with a text label or alt text.
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
            Copyright and license
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
                , whose artwork is licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  CC-BY 4.0
                </a>
                .
              </p>
              <p>
                You can share, remix, and build on the artwork in any medium or
                format, as long as you credit the original creator. Commercial
                use is allowed.
              </p>
              <p className="font-medium">
                The creator of EmojiSalon holds no copyright over what you make.
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
          <ArticleHeading id="open-source">Open source</ArticleHeading>
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
