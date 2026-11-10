/**
 * @fileoverview Catch-all route that redirects to home page.
 * Handles any unmatched routes and redirects them to the root path.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { localeForPath } from "@/lib/locale";

/**
 * Catch-all route configuration.
 * Redirects all unmatched routes to the home page.
 */
export const Route = createFileRoute("/$")({
  beforeLoad: ({ location }) => {
    const locale = localeForPath(location.pathname);
    throw redirect({
      to: locale === "zh-TW" ? "/zh_tw" : locale === "ja" ? "/ja" : "/",
    });
  },
});
