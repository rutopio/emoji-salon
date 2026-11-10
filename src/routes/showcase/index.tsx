/**
 * @fileoverview Showcase page route for displaying emoji color variations.
 * Displays a collection of customized emoji variants from showcase data.
 */

import { MagicWandIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import ShowcaseSection from "@/components/showcase/showcase-section";
import { Button } from "@/components/ui/button";
import showcaseData from "@/data/showcase/showcase-data.json";
import PageLayout from "@/layout";
import { GITHUB_ISSUE_BASE_URL, SITE_URL } from "@/lib/constants";

/**
 * Showcase page route configuration.
 */
export const Route = createFileRoute("/showcase/")({
  component: ShowcasePage,
  head: () => ({
    meta: [
      {
        title: "Showcase | EmojiSalon - Coloring Your Emoji",
      },
      {
        name: "description",
        content:
          "Explore creative emoji color variations created by the community. Download or remix customized emoji designs.",
      },
      {
        property: "og:title",
        content: "Showcase | EmojiSalon - Coloring Your Emoji",
      },
      {
        property: "og:description",
        content:
          "Explore creative emoji color variations created by the community. Download or remix customized emoji designs.",
      },
      {
        property: "og:url",
        content: `${SITE_URL}/showcase`,
      },
      {
        property: "og:image",
        content: `${SITE_URL}/social.png`,
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/showcase` }],
  }),
});

/**
 * Showcase page component.
 * Displays a grid of emoji variants from the showcase data.
 * Each section shows original and customized emoji variations.
 *
 * @returns Showcase page component.
 */
function ShowcasePage() {
  return (
    <PageLayout>
      <div className="flex min-w-0 flex-1 flex-col py-6 sm:py-12">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-balance font-bold text-lg leading-[1.65]">
            Showcase
          </h1>
          <p className="text-pretty text-base text-neutral-800 leading-[1.65] dark:text-neutral-300">
            Explore creative emoji color variations
          </p>
          <div>
            <Button
              nativeButton={false}
              render={
                <a
                  href={GITHUB_ISSUE_BASE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <MagicWandIcon className="mr-2 size-4" aria-hidden="true" />
                  Submit Your Own
                </a>
              }
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          {showcaseData.sections.map((section) => (
            <ShowcaseSection
              key={section.emoji}
              emoji={section.emoji}
              variants={section.variants}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
