/**
 * @fileoverview Showcase page route for displaying emoji color variations.
 * Displays a collection of customized emoji variants from showcase data.
 */

import { MagicWandIcon } from "@phosphor-icons/react";
import { Button } from "@rutopio/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import PageLayout from "@/components/layout/page-layout";
import ShowcaseSection from "@/components/showcase/showcase-section";
import showcaseData from "@/data/showcase/showcase-data.json";
import { useT } from "@/hooks/use-translation";
import { GITHUB_ISSUE_BASE_URL } from "@/lib/constants";
import { pageHead } from "@/lib/page-meta";

/**
 * Showcase page route configuration.
 */
export const Route = createFileRoute("/showcase/")({
  component: ShowcasePage,
  head: () => pageHead("en", "showcase"),
});

/**
 * Showcase page component.
 * Displays a grid of emoji variants from the showcase data.
 * Each section shows original and customized emoji variations.
 *
 * @returns Showcase page component.
 */
export function ShowcasePage() {
  const t = useT();
  return (
    <PageLayout>
      <div className="flex min-w-0 flex-1 flex-col py-6 sm:py-12">
        <div className="flex flex-col items-start gap-6">
          <h1 className="text-lg leading-[1.65] font-bold text-balance">
            {t("Showcase")}
          </h1>
          <p className="text-base leading-[1.65] text-pretty text-neutral-800 dark:text-neutral-300">
            {t("Browse emoji color variations from the community")}
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
                  {t("Submit your own")}
                </a>
              }
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-16">
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
