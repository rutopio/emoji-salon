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
          "Learn about EmojiSalon, how it works, accessibility features for visually impaired users, and open source licensing.",
      },
      {
        property: "og:title",
        content: "About | EmojiSalon - Coloring Your Emoji",
      },
      {
        property: "og:description",
        content:
          "Learn about EmojiSalon, how it works, accessibility features for visually impaired users, and open source licensing.",
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
 * accessibility features, copyright information, and open source details.
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
          <ArticleHeading id="how-it-works">How It Works</ArticleHeading>
          <p className="text-pretty">
            EmojiSalon uses Twemoji SVG data for emoji rendering. You can select
            any emoji, customize its colors using an intuitive color palette
            system, and download your creation as SVG or PNG for personal or
            commercial use. The tool provides full creative control over each
            color component of the emoji, allowing for endless customization
            possibilities.
          </p>
        </section>

        {/* Accessibility section */}
        <section className="flex flex-col gap-6">
          <ArticleHeading id="accessibility">Accessibility</ArticleHeading>
          <p className="text-pretty">
            Emoji accessibility is not just a binary between being able to see
            emoji perfectly and not being able to see them at all — it is a
            spectrum that accounts for multiple experiences.
          </p>

          <div className="flex flex-col gap-16">
            {/* Challenges */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="challenges" level={3}>
                Challenges for Visually Impaired Users
              </ArticleHeading>
              <p className="text-pretty">
                For people with color vision deficiencies, color blindness, or
                low vision, identifying certain emojis can be challenging:
              </p>
              <ul className="ml-6 flex list-disc flex-col gap-1">
                <li>
                  <strong>Similar colors:</strong> Emoji may appear blurry or
                  distorted, making it difficult to distinguish between
                  similar-looking icons
                </li>
                <li>
                  <strong>Color-based identification:</strong> Many users
                  identify emoji by color or general shape rather than fine
                  details
                </li>
                <li>
                  <strong>Multiple emoji in sequence:</strong> When several
                  emoji appear in a row, they can be hard to tell apart,
                  especially with similar colors
                </li>
                <li>
                  <strong>Small keyboard icons:</strong> Emoji keyboards have
                  small icons arranged closely together, making selection
                  difficult
                </li>
              </ul>
            </div>

            {/* Commonly Confused Emoji */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="commonly-confused-emoji" level={3}>
                Commonly Confused Emoji
              </ArticleHeading>
              <div className="flex flex-col gap-2">
                <p>
                  <strong>Flag emoji</strong> with similar color schemes are
                  particularly problematic:
                </p>
                <ul className="ml-6 flex list-disc flex-col gap-1">
                  <li>🇮🇹 Italy / 🇮🇪 Ireland</li>
                  <li>🇷🇴 Romania / 🇹🇩 Chad</li>
                  <li>🇱🇻 Latvia / 🇦🇹 Austria</li>
                  <li>🇲🇨 Monaco / 🇮🇩 Indonesia</li>
                </ul>
                <p className="pt-2">
                  <strong>Heart emoji</strong> colors can also be easily
                  confused:
                </p>
                <ul className="ml-6 flex list-disc flex-col gap-1">
                  <li>❤️ Red / 💜 Purple</li>
                  <li>💙 Blue / 💜 Purple</li>
                  <li>💚 Green / 🧡 Orange</li>
                </ul>
              </div>
            </div>

            {/* How EmojiSalon Helps */}
            <div className="flex flex-col gap-6">
              <ArticleHeading id="how-emoji-salon-helps" level={3}>
                How EmojiSalon Helps
              </ArticleHeading>
              <p className="text-pretty">
                Most current emoji designs do not consider these accessibility
                needs. EmojiSalon provides a solution by allowing users to:
              </p>
              <ul className="ml-6 flex list-disc flex-col gap-1">
                <li>Customize emoji colors for better personal distinction</li>
                <li>
                  Create high-contrast variants tailored to individual visual
                  needs
                </li>
                <li>
                  Generate easily distinguishable emoji for users with specific
                  color vision deficiencies
                </li>
              </ul>
            </div>

            {/* See more */}
            <div className="flex flex-col gap-2">
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
